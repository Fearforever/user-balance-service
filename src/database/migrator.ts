import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { ConfigService } from '@nestjs/config';
import { Pool } from "pg";

async function runMigrations() {
  const config = new ConfigService();
  const pool = new Pool({
    connectionString: config.get('DATABASE_URL'),
  });
  const db = drizzle(pool);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed.');
  await pool.end();
}

runMigrations().catch(console.error);