import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from "./database/drizzle.module.js";
import { UserModule } from "./users/user.module.js";
import { BullModule } from "@nestjs/bullmq";
import { RedisService } from "./cashe/redis.service.js";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      skipProcessEnv: process.env.NODE_ENV === 'test',
    }),
    DrizzleModule,
    UserModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
  ],
  providers: [RedisService],
})
export class AppModule {}
