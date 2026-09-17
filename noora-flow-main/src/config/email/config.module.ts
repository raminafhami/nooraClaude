import { Module } from '@nestjs/common';
import configuration from './configuration';
import validationSchema from './config.validation';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
      cache: true,
    }),
  ],
  providers: [ConfigService, EmailConfigService],
  exports: [ConfigService, EmailConfigService],
})
export class EmailConfigModule {}
