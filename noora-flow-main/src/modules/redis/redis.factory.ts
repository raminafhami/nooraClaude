import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisConfigService } from 'src/config/database/redis/config.service';

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: (configService: RedisConfigService) => {
    const redisInstance = new Redis({
      host: configService.host,
      port: configService.port,
      db: configService.dbIndex,
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [RedisConfigService],
};
