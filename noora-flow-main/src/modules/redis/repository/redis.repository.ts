import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisRepositoryInterface } from '../interface/redis.repository.interface';

@Injectable()
export class RedisRepository
  implements OnModuleDestroy, RedisRepositoryInterface
{
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  async get(prefix: string, key: string): Promise<string | null> {
    return this.redisClient.get(`${prefix}:${key}`);
  }

  async set(prefix: string, key: string, value: string): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value);
  }

  async delete(prefix: string, key: string): Promise<void> {
    await this.redisClient.del(`${prefix}:${key}`);
  }

  async exsits(prefix: string, key: string): Promise<boolean> {
    const result = await this.redisClient.exists(`${prefix}:${key}`);
    return !!result;
  }

  async setWithExpiry(
    prefix: string,
    key: string,
    value: string,
    expiry: number,
  ): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
  }

  async getTtl(prefix: string, key: string): Promise<number> {
    return await this.redisClient.ttl(`${prefix}:${key}`);
  }

  async sadd(prefix: string, key: string, value: any) {
    return await this.redisClient.sadd(`${prefix}:${key}`, value);
  }

  async smembers(prefix: string, key: string) {
    return await this.redisClient.smembers(`${prefix}:${key}`);
  }

  async srem(prefix: string, key: string, value: any) {
    return await this.redisClient.srem(`${prefix}:${key}`, value);
  }
}
