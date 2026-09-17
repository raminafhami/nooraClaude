import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisRepository } from './repository/redis.repository';
import { redisClientFactory } from './redis.factory';
@Global()
@Module({
  imports: [],
  providers: [redisClientFactory, RedisRepository, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
