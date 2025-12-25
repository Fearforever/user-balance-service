import { UseInterceptors } from '@nestjs/common';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';

export const Transactional = () => UseInterceptors(TransactionInterceptor);