import { Controller, Post, Param, Body, Get, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { WithdrawBalanceDto } from './dto/withdraw-balance.dto';
import { ParseIntPipe } from '@nestjs/common';
import { Transactional } from '../common/decorators/transactional.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ValidationPipe } from "../common/pipes/validation.pipe";

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post(':id/withdraw')
  @Transactional()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @ApiOperation({ summary: 'Withdraw balance from user' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: WithdrawBalanceDto })
  @ApiResponse({ status: 200, description: 'Successful withdrawal', type: Object })
  @ApiResponse({ status: 400, description: 'Insufficient funds' })
  @ApiResponse({ status: 409, description: 'Operation in progress (retry)' })
  async withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: WithdrawBalanceDto,
  ) {
    return this.userService.withdraw(id, dto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get user balance' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, schema: { example: { balance: 100000 } } })
  async getBalance(@Param('id', ParseIntPipe) id: number) {
    return { balance: await this.userService.getBalance(id) };
  }
}