import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { users, balanceHistory } from '../database/schema';
import { eq, sql } from 'drizzle-orm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { WithdrawBalanceDto } from "./dto/withdraw-balance.dto";
import { RedisService } from "../cashe/redis.service";

const LOCK_TTL_MS = 10_000;

@Injectable()
export class UserService {
  constructor(
    private db: DrizzleService,
    private redis: RedisService,
    @InjectQueue('balance-recalc') private recalcQueue: Queue,
  ) {}

  async withdraw(userId: number, dto: WithdrawBalanceDto) {
    const lockKey = `balance:lock:${userId}`;
    const idempotencyKey = `balance:idemp:${userId}:${dto.idempotencyKey}`;

    const already = await this.redis.get(idempotencyKey);
    if (already) {
      return JSON.parse(already);
    }

    const locked = await this.redis.set(lockKey, '1', 'PX', LOCK_TTL_MS, 'NX');
    if (!locked) {
      throw new ConflictException('Balance operation in progress, try again');
    }

    try {
      return await this.db.transaction(async (tx) => {
        const user = await tx
          .select({ balance: users.balance })
          .from(users)
          .where(eq(users.id, userId))
          .for('update')
          .then(r => r[0]);

        if (!user) throw new NotFoundException();

        if (user.balance < dto.amountCents) {
          throw new BadRequestException('Insufficient funds');
        }

        await tx
          .update(users)
          .set({ balance: user.balance - dto.amountCents })
          .where(eq(users.id, userId));

        const [history] = await tx
          .insert(balanceHistory)
          .values({
            userId,
            action: 'withdraw',
            amount: -dto.amountCents,
            reason: dto.reason,
          })
          .returning();

        const result = {
          newBalance: user.balance - dto.amountCents,
          transactionId: history.id,
          ts: history.ts,
        };

        await this.redis.setEx(idempotencyKey, 3600, JSON.stringify(result));

        await this.redis.del(`balance:cache:${userId}`);

        return result;
      });
    } catch (error) {
      if (error.code === '23514' || error.code === '22003') {
        await this.recalcQueue.add('recalc', { userId }, { priority: 1 });
      }
      throw error;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async recalcBalance(userId: number) {
    const lockKey = `balance:recalc:${userId}`;
    const acquired = await this.redis.setNxEx(lockKey, '1', 60);
    if (!acquired) return;

    try {
      const sum = await this.db.db
        .select({ sum: sql<number>`sum(${balanceHistory.amount})` })
        .from(balanceHistory)
        .where(eq(balanceHistory.userId, userId));

      await this.db.db
        .update(users)
        .set({ balance: sum[0].sum ?? 0 })
        .where(eq(users.id, userId));

      await this.redis.setEx(`balance:cache:${userId}`, 300, sum[0].sum ?? 0);
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async getBalance(userId: number): Promise<number> {
    const cacheKey = `balance:cache:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return Number(cached);

    const user = await this.db.db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .then(r => r[0]);

    if (user) {
      await this.redis.setEx(cacheKey, 60, user.balance);
      return user.balance;
    }

    throw new NotFoundException();
  }
}