import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app/config.service';

@Injectable()
export class CurrencyRateService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly httpService: HttpService,
  ) {}
  async getLatestPrices() {
    try {
      let response = await firstValueFrom(
        this.httpService.request({
          method: 'get',
          url: `${this.appConfigService.currencyApiUrl}/free?format=json&limit=30&page=1`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.appConfigService.currencyApiKey,
          },
          data: {},
        }),
      );
      return response.data.result;
    } catch (error) {
      throw new InternalServerErrorException('Something wrong happened');
    }
  }

  public extractOneCurrency(list: [], key: string) {
    return list.find((obj) => obj['key'] === key);
  }

  public async getOne(key: string, func?: any) {
    if (!func) {
      func = this.getLatestPrices;
    }

    const list: any = await this[func].call(this);

    let currency = list.data.find((item) => item.key == key);

    return {
      key: currency?.key,
      category: currency?.category,
      title: currency['عنوان'],
      price: currency['قیمت'],
      change: currency['تغییر'],
      max: currency['بیشترین'],
      min: currency['کمترین'],
      updatedAt: currency?.updated_at,
    };
  }

  async getTransferRates() {
    try {
      let response = await firstValueFrom(
        this.httpService.request({
          method: 'get',
          url: `${this.appConfigService.currencyApiUrl}/transfer?format=json&limit=30&page=1`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: this.appConfigService.currencyApiKey,
          },
          data: {},
        }),
      );
      return response.data.result;
    } catch (error) {
      throw new InternalServerErrorException('Something wrong happened');
    }
  }

}
