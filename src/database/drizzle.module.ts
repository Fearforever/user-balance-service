import { Module, Global } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from './schema';

@Global()
@Module({
  providers: [
    {
      provide: DrizzleService,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const pool = new Pool({
          connectionString: config.get('DATABASE_URL'),
          ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        });
        const db = drizzle(pool, { schema });
        return new DrizzleService(db);
      },
    },
  ],
  exports: [DrizzleService],
})
export class DrizzleModule {}
