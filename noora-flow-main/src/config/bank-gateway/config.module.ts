import { Module } from '@nestjs/common';
import configuration from './configuration';
import validationSchema from './config.validation';
import { BankGatewayConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
      cache: true,
    }),
  ],
  providers: [ConfigService, BankGatewayConfigService],
  exports: [ConfigService, BankGatewayConfigService],
})
export class BankGatewayConfigModule {}
