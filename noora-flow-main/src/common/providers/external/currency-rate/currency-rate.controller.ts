import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrencyRateService } from './currency-rate.service';

@ApiTags('currency-rate')
@ApiBearerAuth('token')
@Controller('currency-rate')
export class CurrencyRateController {
  constructor(private readonly currencyRateService: CurrencyRateService) {}
  @Get('/latest')
  async getLatestPrices() {
    return this.currencyRateService.getLatestPrices();
  }

  @Get('transfer-rates')
  async getTransferRates() {
    return this.currencyRateService.getTransferRates();
  }

  @Get(':key')
  async getOne(@Param('key') key: string, @Query('type') type?: string) {
    return this.currencyRateService.getOne(key, type);
  }
}
