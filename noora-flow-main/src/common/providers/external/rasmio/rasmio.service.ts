import {
  Get,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AppConfigService } from 'src/config/app/config.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RasmioService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getCompanyInfo(companyId: string, query?: any) {
    let result: {} = {};
    try {
      let response = await firstValueFrom(
        this.httpService.request({
          method: 'get',
          url: `${this.appConfigService.rasmioUrl}/Company/${companyId}`,
          headers: {
            'X-KEY': this.appConfigService.rasmioApiKey,
            'Content-Type': 'application/json',
          },
          data: {},
        }),
      );
      const data = response.data;

      if (query?.projection) {
        const projection = query.projection.split(',');
        for (let key of projection) {
          result[key] = data[key];
        }
        return result;
      }
      return data;
    } catch (error) {
      if (error.response.data.status === 404) {
        throw new NotFoundException('Record not found');
      }

      throw new InternalServerErrorException('something is wrong');
    }
  }

  async getPersonInfo(personId: string, query?: any) {
    let result: {} = {};
    try {
      let response = await firstValueFrom(
        this.httpService.request({
          method: 'get',
          url: `${this.appConfigService.rasmioUrl}/Person/${personId}`,
          headers: {
            'X-KEY': this.appConfigService.rasmioApiKey,
            'Content-Type': 'application/json',
          },
          data: {},
        }),
      );
      const data = response.data;
      if (query?.projection) {
        const projection = query.projection.split(',');
        for (let key of projection) {
          result[key] = data[key];
        }
        return result;
      }
      return data;
    } catch (error) {
      if (error.response.data.status === 404) {
        throw new NotFoundException('Record not found');
      }
      throw new InternalServerErrorException('something is wrong');
    }
  }

  async searchTerm(query: any) {
    let result: {} = {};
    try {
      let response = await firstValueFrom(
        this.httpService.request({
          method: 'get',
          url: `${this.appConfigService.rasmioUrl}/Search?term=${query.term}`,
          headers: {
            'X-KEY': this.appConfigService.rasmioApiKey,
            'Content-Type': 'application/json',
          },
          data: {},
        }),
      );
      const data = response.data;
      if (query?.projection) {
        const projection = query.projection.split(',');
        for (let key of projection) {
          result[key] = data[key];
        }
        return result;
      }
      return data;
    } catch (error) {
      if (error.response.data.status === 404) {
        throw new NotFoundException('Record not found');
      }
      throw new InternalServerErrorException('something is wrong');
    }
  }
}
