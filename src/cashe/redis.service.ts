import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      host: config.get('REDIS_HOST') || 'localhost',
      port: Number(config.get('REDIS_PORT')) || 6379,
      password: config.get('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async onModuleInit() {
    await this.ping();
  }

  async onModuleDestroy() {
    await this.quit();
  }

  async setEx(key: string, ttlSeconds: number, value: string | number): Promise<string | null> {
    return this.set(key, value, 'EX', ttlSeconds);
  }

  async setNxEx(key: string, value: string | number, ttlSeconds: number): Promise<'OK' | null> {
    return this.set(key, value.toString(), 'EX', ttlSeconds, 'NX');
  }
}