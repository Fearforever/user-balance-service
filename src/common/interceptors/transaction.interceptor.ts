import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { tap, catchError } from 'rxjs/operators';
import { DrizzleService } from '../../database/drizzle.service';
import { firstValueFrom } from "rxjs";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private db: DrizzleService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    return this.db.transaction(async (tx) => {
      const request = context.switchToHttp().getRequest();
      request.tx = tx;

      const result = await firstValueFrom(
        next.handle().pipe(
          tap(() => {}),
          catchError((err) => {
            throw err;
          }),
        ),
      );

      return result;
    });
  }
}