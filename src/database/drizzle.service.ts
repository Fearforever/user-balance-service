import { Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from './schema';

@Injectable()
export class DrizzleService {
  constructor(public db: NodePgDatabase<typeof schema>) {}

  async transaction<T>(fn: (tx: typeof this.db) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      try {
        return await fn(tx);
      } catch (error) {
        throw error;
      }
    });
  }
}