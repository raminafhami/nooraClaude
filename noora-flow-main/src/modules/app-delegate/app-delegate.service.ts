import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class AppDelegateService {
  constructor(
    private readonly userService: UsersService,
    private readonly smsService: SmsService,
  ) {}
  async getUser(instance: any, params: any, output: string) {
    const data = await this.userService.findById(params.userId);

    if (output) {
      return {
        ...instance?.parameters,
        [output]: data,
      };
    } else {
      return instance?.parameters;
    }
  }

  async certSmsNotiy(instance: any, params: any, output: string) {
    const parameters = instance?.parameters;
    const user = await this.userService.findById(
      parameters?.Assignees?.customer?.id,
    );
    if (user.phoneNo) {
      await this.smsService.sendSmsDynamicTemplateAndParamters(
        user.phoneNo,
        '476703',
        [
          {
            name: 'CUSTOMERNAME',
            value: parameters?.Assignees?.customer?.name,
          },
          { name: 'CASENO', value: instance?.caseNo },
          { name: 'BUYERNAME', value: parameters?.Buyer?.name },
          { name: 'PROFORMANO', value: parameters?.ProformaNo },
        ],
      );
    }

    return parameters;
  }

  async processStartSms(instance: any, params: any, output: string){
    const parameters = instance?.parameters;
    const user = await this.userService.findById(
      parameters?.Assignees?.customer?.id,
    );
    if (user.phoneNo) {
      await this.smsService.sendSmsDynamicTemplateAndParamters(
        user.phoneNo,
        '643681',
        [
          {
            name: 'CUSTOMERNAME',
            value: parameters?.Assignees?.customer?.name,
          },
          { name: 'CASENO', value: instance?.caseNo },
          { name: 'BUYERNAME', value: parameters?.Buyer?.name },
        ],
      );
    }
    return parameters;
  }
}
