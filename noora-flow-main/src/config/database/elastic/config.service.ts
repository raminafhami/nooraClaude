import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get node(): string {
    return this.configService.get<string>('elastic.node');
  }

  public get username(): string {
    return this.configService.get<string>('elastic.username');
  }

  public get password(): string {
    return this.configService.get<string>('elastic.password');
  }
}
