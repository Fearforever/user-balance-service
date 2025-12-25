import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BullModule } from '@nestjs/bullmq';
import { BalanceRecalcProcessor } from "../queue/balance-recalc.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'balance-recalc',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, BalanceRecalcProcessor],
})
export class UserModule {}