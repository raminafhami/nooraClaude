import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get host(): string {
    return this.configService.get<string>('redis.host');
  }

  public get port(): number {
    return this.configService.get<number>('redis.port');
  }

  public get dbIndex(): number {
    return this.configService.get<number>('redis.dbIndex');
  }
}
