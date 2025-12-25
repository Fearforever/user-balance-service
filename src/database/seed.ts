import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  await db
    .insert(users)
    .values({ id: 1, balance: 100000 })
    .onConflictDoNothing();

  console.log('Seeded user id=1 with balance 100000');
  await pool.end();
}

seed().catch(console.error);