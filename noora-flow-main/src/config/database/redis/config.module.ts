import { Global, Module } from '@nestjs/common';
import configuration from './configuration';
import validationSchema from './config.validation';
import { RedisConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema,
      cache: true,
    }),
  ],
  providers: [ConfigService, RedisConfigService],
  exports: [ConfigService, RedisConfigService],
})
export class RedisConfigModule {}
