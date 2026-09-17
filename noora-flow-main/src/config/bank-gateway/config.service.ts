import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BankGatewayConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get IKCPublicKey(): string {
    return this.configService.get<string>('bankGateway.IKCPublicKey');
  }

  public get terminalId(): string {
    return this.configService.get<string>('bankGateway.terminalId');
  }

  public get acceptorId(): string {
    return this.configService.get<string>('bankGateway.acceptorId');
  }

  public get passPhrase(): string {
    return this.configService.get<string>('bankGateway.passPhrase');
  }

  public get revertUri(): string {
    return this.configService.get<string>('bankGateway.revertUri');
  }
}
