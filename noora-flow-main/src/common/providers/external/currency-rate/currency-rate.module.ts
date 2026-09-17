import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app/config.module';
import { CurrencyRateService } from './currency-rate.service';
import { HttpModule } from '@nestjs/axios';
import { CurrencyRateController } from './currency-rate.controller';

@Module({
  imports: [AppConfigModule, HttpModule],
  providers: [CurrencyRateService],
  controllers: [CurrencyRateController],
  exports: [CurrencyRateService],
})
export class CurrencyRateModule {}
