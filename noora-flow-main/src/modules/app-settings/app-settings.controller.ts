import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppSettingsService } from './app-settings.service';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ChangeSettingDto } from './dto/change-setting.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiBearerAuth('token')
@ApiTags('settings')
@Controller('settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.SETTING,
  })
  @Put('own')
  async changeOwnSetting(
    @ActiveUser() user: ActiveUserData,
    @Body() data: ChangeSettingDto,
  ) {
    const setting = await this.appSettingsService.findOneAndUpdate(
      {
        key: user.id,
      },
      data,
      true,
    );

    return setting;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SETTING,
  })
  @Get('own')
  async getUserSetting(@ActiveUser() user: ActiveUserData) {
    const setting = await this.appSettingsService.findOne({ key: user.id });
    return setting;
  }
}
