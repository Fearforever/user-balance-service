import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from "./database/drizzle.module.js";
import { UserModule } from "./users/user.module.js";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { RedisModule } from "./cashe/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      skipProcessEnv: process.env.NODE_ENV === 'test',
    }),
    DrizzleModule,
    UserModule,
    RedisModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  providers: [],
})
export class AppModule {}
