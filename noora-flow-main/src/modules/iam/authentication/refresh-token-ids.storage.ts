import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisConfigService } from 'src/config/database/redis/config.service';

export class InvalidateRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenIdsStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;
  constructor(private readonly redisConfigService: RedisConfigService) {}
  onApplicationBootstrap() {
    this.redisClient = new Redis({
      host: this.redisConfigService.host,
      port: this.redisConfigService.port,
      db: this.redisConfigService.dbIndex,
    });
  }
  onApplicationShutdown(signal?: string) {
    return this.redisClient.quit();
  }

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenId);
  }
  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.redisClient.get(this.getKey(userId));
    if (storedId !== tokenId) {
      throw new InvalidateRefreshTokenError();
    }
    return storedId === tokenId;
  }
  async invalidate(userId: string): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }
  private getKey(userId: string): string {
    return `user-${userId}`;
  }
}
