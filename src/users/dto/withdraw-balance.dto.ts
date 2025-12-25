import { IsInt, Min, Max, IsIn, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from "@nestjs/swagger";

export class WithdrawBalanceDto {
  @ApiProperty({ description: 'Amount in cents (e.g., 10000 = $100)', example: 10000 })
  @IsInt()
  @Min(1)
  @Max(1_000_000_00)
  @Type(() => Number)
  amountCents: number;

  @ApiProperty({ enum: ['purchase', 'withdraw', 'fee'], example: 'purchase' })
  @IsIn(['purchase', 'withdraw', 'fee'])
  reason: string;

  @ApiProperty({ description: 'Idempotency key to prevent duplicates', example: 'uuid-v4-or-order-id' })
  @IsString()
  @Matches(/^[a-zA-Z0-9\-_]{36,128}$/)
  idempotencyKey: string;
}