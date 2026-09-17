import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get name(): string {
    return this.configService.get<string>('app.name');
  }

  public get env(): string {
    return this.configService.get<string>('app.env');
  }

  public get port(): number {
    return this.configService.get<number>('app.port');
  }

  public get sepidar(): string {
    return this.configService.get<string>('app.sepidar');
  }

  public get smsApiKey(): string {
    return this.configService.get<string>('app.smsApiKey');
  }

  public get smsUri(): string {
    return this.configService.get<string>('app.smsUri');
  }

  public get rasmioApiKey(): string {
    return this.configService.get<string>('app.rasmiopApiKey');
  }

  public get rasmioUrl(): string {
    return this.configService.get<string>('app.rasmioUrl');
  }

  public get currencyApiKey(): string {
    return this.configService.get<string>('app.currencyApiKey');
  }

  public get currencyApiUrl(): string {
    return this.configService.get<string>('app.currencyApiUrl');
  }

  public get customerNaitcoUrl(): string {
    return this.configService.get<string>('app.customerNaitcoUrl');
  }

  public get recaptchaSecretKey(): string {
    return this.configService.get<string>('app.recaptchaSecretKey');
  }

  public get recaptchaVerifyUrl(): string {
    return this.configService.get<string>('app.recaptchaVerifyUrl');
  }

  public get swaggerUsername(): string {
    return this.configService.get<string>('app.swaggerUsername');
  }

  public get swaggerPassword(): string {
    return this.configService.get<string>('app.swaggerPassword');
  }

  public get processWithoutFileThreshold(): string {
    return this.configService.get<string>('app.processWithoutFileThreshold');
  }

  public get invoiceCryptoSecretKey(): string {
    return this.configService.get<string>('app.invoiceCryptoSecretKey');
  }

  public get invoiceExpiryAlertThreshold(): string {
    return this.configService.get<string>('app.invoiceExpiryAlertThreshold');
  }

  public get encryptionSecret(): string {
    return this.configService.get<string>('app.encryptionSecret');
  }

  public get companyDispatcherType(): string {
    return this.configService.get<string>('app.companyDispatcherType');
  }
}
