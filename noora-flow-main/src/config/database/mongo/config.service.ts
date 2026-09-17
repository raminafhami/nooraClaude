import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get uri(): string {
    return this.configService.get<string>('mongo.uri');
  }

  public get dbName(): string {
    return this.configService.get<string>('mongo.dbName');
  }

  public get user(): string {
    return this.configService.get<string>('mongo.user');
  }

  public get pass(): string {
    return this.configService.get<string>('mongo.pass');
  }
}
