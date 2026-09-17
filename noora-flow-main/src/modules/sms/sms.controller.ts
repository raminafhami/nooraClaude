import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app/config.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { UsersService } from '../users/services/users.service';
import { SmsService } from './sms.service';

@ApiBearerAuth('token')
@ApiTags('sms')
@Controller('sms')
export class SmsController {
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    private readonly userService: UsersService,
    private readonly smsService: SmsService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.SMS,
  })
  @Post()
  async sendMessage(@Body() sendMessageDto: SendMessageDto) {
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
            Mobile: sendMessageDto.phoneNo,
            TemplateId: sendMessageDto.templateNo,
            Parameters: sendMessageDto.messageParameters,
          },
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException('problem in sending sms.');
    }
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.SMS,
  })
  @Get('send-contract-verification-code')
  async sendContractVerificationCode(@ActiveUser() activeUser: ActiveUserData) {
    const user = await this.userService.findById(activeUser.id);
    return await this.smsService.sendContractVerificationCode(user.phoneNo);
  }
}

/**
   * const result = await firstValueFrom(
      this.httpService.request({
        method: 'post',
        url: 'https://api.sms.ir/v1/send/bulk',
        headers: {
          'X-API-KEY':
            'YKpcbBpImBHPEPjSJCSKsDIm1eOWUa3NZyfxSLuXYln3iy8dv3BmzbAzrv0HyA0j',
          'Content-Type': 'application/json',
        },
        data: {
          lineNumber: 100091304500,
          messageText: messageDate.text,
          mobiles: [messageDate.phoneNumber],
          sendDateTime: null,
        },
      }),
    );
   */
