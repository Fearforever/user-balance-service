import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  balance: integer('balance').notNull().default(0),
});

export const balanceHistory = pgTable('balance_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  reason: varchar('reason', { length: 100 }).notNull(),
  ts: timestamp('ts').notNull().defaultNow(),
});

export const schema = { users, balanceHistory };
export type Schema = typeof schema;