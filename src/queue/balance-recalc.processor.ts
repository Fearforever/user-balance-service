import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserService } from '../users/user.service';

@Processor('balance-recalc')
export class BalanceRecalcProcessor extends WorkerHost {
  constructor(private usersService: UserService) {
    super();
  }

  async process(job: Job<{ userId: number }>): Promise<void> {
    await this.usersService.recalcBalance(job.data.userId);
  }
}