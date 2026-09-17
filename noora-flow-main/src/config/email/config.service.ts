import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get host(): string {
    return this.configService.get<string>('email.host');
  }

  public get port(): number {
    return this.configService.get<number>('email.port');
  }

  public get username(): string {
    return this.configService.get<string>('email.username');
  }

  public get password(): string {
    return this.configService.get<string>('email.password');
  }

  public get secure(): boolean {
    return this.configService.get<string>('email.secure') === 'true';
  }
}
