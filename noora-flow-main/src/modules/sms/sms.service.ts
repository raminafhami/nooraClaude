import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app/config.service';
import { SendVerificationCodeDto } from './dto/send-verification-code.dto';
import { RedisService } from '../redis/redis.service';
import { RedisPrefixEnum } from '../redis/redis.prefix.enum';
import { generateVerificationCode } from 'src/common/utils/data.util';
import { smsTemplates } from 'src/common/const/enums';

@Injectable()
export class SmsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    private readonly redisService: RedisService,
  ) {}

  public async sendVerificationCode(
    sendVerificationCodeDto: SendVerificationCodeDto,
  ) {
    const { mobile } = sendVerificationCodeDto;
    const isDevEnvironment = this.appConfigService.env === 'development';
    const isProdEnvironment = this.appConfigService.env === 'production';

    if (await this.redisService.existVerificationCode(mobile)) {
      const ttl = await this.redisService.getTtl(
        RedisPrefixEnum.VERIFICATION_CODE,
        mobile,
      );
      return { expireInSeconds: ttl };
    }

    const verificationCode = generateVerificationCode(isDevEnvironment);

    await this.redisService.setVerificationCode(mobile, verificationCode);

    const ttl = await this.redisService.getTtl(
      RedisPrefixEnum.VERIFICATION_CODE,
      mobile,
    );

    if (isProdEnvironment) {
      await this.sendVerificationSms(mobile, verificationCode);
    }

    return { expireInSeconds: ttl };
  }

  private async sendVerificationSms(mobile: string, verificationCode: string) {
    try {
      await firstValueFrom(
        this.httpService.request({
          method: 'post',
          url: `${this.appConfigService.smsUri}/v1/send/verify`,
          headers: {
            'X-API-KEY': this.appConfigService.smsApiKey,
            'Content-Type': 'application/json',
          },
          data: {
            Mobile: mobile,
            TemplateId: '187960',
            Parameters: [
              {
                name: 'CODE',
                value: verificationCode,
              },
            ],
          },
        }),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while sending the verification code',
      );
    }
  }

  async sendContractVerificationCode(mobile: string) {
    const isDevEnvironment = this.appConfigService.env === 'development';
    const isProdEnvironment = this.appConfigService.env === 'production';

    if (
      await this.redisService.existsDynamicVerificationCode(
        mobile,
        RedisPrefixEnum.CONTRACT_VERIFICATION_CODE,
      )
    ) {
      const ttl = await this.redisService.getTtl(
        RedisPrefixEnum.CONTRACT_VERIFICATION_CODE,
        mobile,
      );
      return { expireInSeconds: ttl };
    }

    const verificationCode = generateVerificationCode(isDevEnvironment);

    await this.redisService.setVerificationDynamicPrefix(
      RedisPrefixEnum.CONTRACT_VERIFICATION_CODE,
      mobile,
      verificationCode,
    );

    const ttl = await this.redisService.getTtl(
      RedisPrefixEnum.CONTRACT_VERIFICATION_CODE,
      mobile,
    );

    if (isProdEnvironment) {
      await this.sendVerificationSmsDynamicTemplate(
        mobile,
        verificationCode,
        smsTemplates.ContractVerification,
      );
    }

    return { expireInSeconds: ttl };
  }

  private async sendVerificationSmsDynamicTemplate(
    mobile: string,
    verificationCode: string,
    templateId: string,
  ) {
    try {
      await firstValueFrom(
        this.httpService.request({
          method: 'post',
          url: `${this.appConfigService.smsUri}/v1/send/verify`,
          headers: {
            'X-API-KEY': this.appConfigService.smsApiKey,
            'Content-Type': 'application/json',
          },
          data: {
            Mobile: mobile,
            TemplateId: templateId,
            Parameters: [
              {
                name: 'CODE',
                value: verificationCode,
              },
            ],
          },
        }),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while sending the verification code',
      );
    }
  }

  public async sendRememberAlert(alertData: any) {
    const { phoneNo, translatedTitle, jalaliDate, buyer } = alertData;

    const parameters = [
      { name: 'TITLE', value: translatedTitle },
      { name: 'JALALIDATE', value: jalaliDate },
      ...(buyer ? [{ name: 'BUYER', value: buyer }] : []),
    ];

    try {
      await firstValueFrom(
        this.httpService.request({
          method: 'post',
          url: `${this.appConfigService.smsUri}/v1/send/verify`,
          headers: {
            'X-API-KEY': this.appConfigService.smsApiKey,
            'Content-Type': 'application/json',
          },
          data: {
            Mobile: phoneNo,
            TemplateId: buyer ? '413905' : '512970',
            Parameters: parameters,
          },
        }),
      );
    } catch (error) {
      console.error('Error sending reminder alert SMS', error);
      throw new InternalServerErrorException(
        'Failed to send reminder alert SMS',
      );
    }
  }

  public async sendWelcomeMessage(data: any) {
    const { phoneNo, lastname } = data;
    try {
      await firstValueFrom(
        this.httpService.request({
          method: 'post',
          url: `${this.appConfigService.smsUri}/v1/send/verify`,
          headers: {
            'X-API-KEY': this.appConfigService.smsApiKey,
            'Content-Type': 'application/json',
          },
          data: {
            Mobile: phoneNo,
            TemplateId: '775408',
            Parameters: [{ name: 'LASTNAME', value: lastname }],
          },
        }),
      );
    } catch (error) {
      console.error('Error sending reminder alert SMS', error);
      throw new InternalServerErrorException(
        'Failed to send reminder alert SMS',
      );
    }
  }

  public async sendSmsDynamicTemplateAndParamters(
    mobile: string,
    templateId: string,
    Parameters: Record<string, any>[],
  ) {
    try {
      await firstValueFrom(
        this.httpService.request({
          method: 'post',
          url: `${this.appConfigService.smsUri}/v1/send/verify`,
          headers: {
            'X-API-KEY': this.appConfigService.smsApiKey,
            'Content-Type': 'application/json',
          },
          data: {
            Mobile: mobile,
            TemplateId: templateId,
            Parameters,
          },
        }),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Something went wrong while sending sms',
      );
    }
  }

  public async sendInvoiceExpiryMessage(data: any) {
    const {
      remainingTime,
      phoneNo,
      invoiceAmount,
      invoiceNo,
      encryptedInvoice,
    } = data;
    try {
      await firstValueFrom(
        this.httpService.request({
          method: 'post',
          url: `${this.appConfigService.smsUri}/v1/send/verify`,
          headers: {
            'X-API-KEY': this.appConfigService.smsApiKey,
            'Content-Type': 'application/json',
          },
          data: {
            Mobile: phoneNo,
            TemplateId: '849754',
            Parameters: [
              { name: 'AMOUNT', value: invoiceAmount },
              { name: 'REMAININGTIME', value: remainingTime },
              { name: 'INVOICENO', value: invoiceNo },
              { name: 'ENCRYPTEDINVOICE', value: encryptedInvoice },
            ],
          },
        }),
      );
    } catch (error) {
      console.error('Error sending reminder alert SMS', error);
      throw new InternalServerErrorException(
        'Failed to send reminder alert SMS',
      );
    }
  }
}
