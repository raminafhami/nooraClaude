import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/providers/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { LoginByPhoneDto } from './dto/login-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Request } from 'express';
import { ActiveUser } from './decorators/active-user.decorator';
import { ActiveUserData } from './interfaces/active-user-data.interface';
import { CheckPermissions } from './decorators/permissions.decorator';
import { PermissionAction, Subjects } from './enums';

@Auth(AuthType.None)
@ApiTags('authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<CustomResponse | CustomError> {
    const { user } = await this.authService.register(registerDto);
    return new CustomResponse(HttpStatus.OK, CustomMessages.USER_CREATED, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() request: Request,
    @Body() loginDto: LoginDto,
  ): Promise<CustomResponse | CustomError> {
    const token = await this.authService.login(request, loginDto);
    return new CustomResponse(
      HttpStatus.OK,
      CustomMessages.LOGIN_SUCCESSFULLY,
      token,
    );
  }

  @Post('login-phone')
  async checkUserRegistration(
    @Req() request: Request,
    @Body() loginByPhoneDto: LoginByPhoneDto,
  ): Promise<any> {
    this.assertOtpLoginEnabled();

    return await this.authService.loginWithPhone(
      request,
      loginByPhoneDto.phoneNo,
    );
  }

  @Post('verify')
  async verify(@Body() verifyOtpDto: VerifyOtpDto) {
    this.assertOtpLoginEnabled();

    return await this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * OTP sign-in is a per-deployment option. Deployments that do not offer it
   * set OTP_LOGIN_ENABLED=false, which closes the two OTP endpoints without
   * touching the OTP implementation itself. Unset or any other value keeps the
   * previous behaviour (enabled).
   */
  private assertOtpLoginEnabled(): void {
    if (process.env.OTP_LOGIN_ENABLED === 'false') {
      throw new CustomError(
        HttpStatus.FORBIDDEN,
        'OTP login is disabled for this deployment.',
      );
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('verify-captcha')
  async verifyCaptcha(@Body() body: any) {
    return await this.authService.verifyRecaptcha(body);
  }

  @ApiBearerAuth('token')
  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.AUTH,
  })
  @Get('create-api-key')
  async generateApiKey(@ActiveUser() activeUser: ActiveUserData) {
    return this.authService.createApiKey(activeUser);
  }
}
