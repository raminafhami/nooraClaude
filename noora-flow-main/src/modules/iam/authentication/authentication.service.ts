import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { HashingService } from '../hashing-and-encryption/hashing.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/modules/iam/config/jwt.config';
import { ActiveUserData } from './interfaces/active-user-data.interface';
import {
  LoginTypes,
  UserDocument,
  UserTypes,
} from 'src/modules/users/schemas/user.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { randomUUID, randomBytes, pbkdf2Sync } from 'crypto';
import {
  InvalidateRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage';
import CustomError from 'src/common/providers/custom-error';
import { SmsService } from 'src/modules/sms/sms.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { AppConfigService } from 'src/config/app/config.service';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    private readonly smsService: SmsService,
    private readonly redisService: RedisService,
    private readonly appConfigService: AppConfigService,
    private readonly httpService: HttpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const isExistUser = await this.usersService.isExist({
      $or: [
        { username: registerDto.username },
        { phoneNo: registerDto.phoneNo },
        { nationalCode: registerDto.nationalCode },
      ],
    });
    if (isExistUser) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        'username, nationalCode or phoneNumber is Exists',
      );
    }

    const { user } = await this.usersService.register({
      ...registerDto,
      password: await this.hashingService.hash(registerDto.password),
    });
    return { user };
  }

  async login(request: Request, loginDto: LoginDto) {
    const user: UserDocument = await this.usersService.findOne(
      {
        phoneNo: loginDto.phoneNo,
      },
      null,
      'groups',
    );

    const origin = request.headers.origin;

    if (!user || !user.isActive) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }

    if (!!user?.loginType && user.loginType === LoginTypes.OTP) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        'you cant login with password',
      );
    }

    if (
      user.type === 'normal' &&
      origin !== this.appConfigService.customerNaitcoUrl
    ) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }

    if (
      user.type &&
      user.type !== 'normal' &&
      origin == this.appConfigService.customerNaitcoUrl
    ) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }

    const isEqual = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }
    const token = await this.generateTokens(user);
    return { token };
  }

  async loginWithPhone(request: Request, phoneNo: string) {
    const origin = request.headers.origin;

    const isRegistered = await this.usersService.findOne({
      phoneNo,
    });

    if (!isRegistered) {
      throw new NotFoundException('User not found');
    }

    if (!isRegistered || !isRegistered.isActive) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }

    if (
      isRegistered.type === 'normal' &&
      origin !== this.appConfigService.customerNaitcoUrl
    ) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }

    if (
      isRegistered.type &&
      isRegistered.type !== 'normal' &&
      origin == this.appConfigService.customerNaitcoUrl
    ) {
      throw new CustomError(HttpStatus.UNAUTHORIZED, 'Invalid login');
    }

    if (
      !!isRegistered?.loginType &&
      isRegistered.loginType === LoginTypes.PASSWORD
    ) {
      throw new CustomError(HttpStatus.BAD_REQUEST, 'you cant login with OTP');
    }

    const codeSent: any = await this.smsService.sendVerificationCode({
      mobile: phoneNo,
    });

    if (!codeSent) {
      throw new InternalServerErrorException(
        'Something went wrong with sending the verification code.',
      );
    }

    return {
      status: 'success',
      expireInSeconds: codeSent.expireInSeconds,
      description: `Verification code was successfully sent to ${phoneNo}.`,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const code = await this.redisService.getVerificationCode(
      verifyOtpDto.phoneNo,
    );

    if (!code || code !== verifyOtpDto.code) {
      throw new UnauthorizedException('Invalid Code');
    }
    const user = await this.usersService.findOne(
      {
        phoneNo: verifyOtpDto.phoneNo,
      },
      null,
      'groups',
    );
    const token = await this.generateTokens(user);
    return { token };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { id, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'id'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        audience: this.jwtConfiguration.audience,
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.usersService.findById(id, 'groups');

      if (user && user.isActive === false) {
        throw new Error('Access denied');
      }

      const isValid = await this.redisService.validateRefreshToken(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this.redisService.invalidateRefreshToken(user.id, refreshTokenId);
      } else {
        throw new Error('Refresh token is Invalid.');
      }
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidateRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  async generateTokens(user: any) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenExpireIn,
        {
          phoneNo: user.phoneNo,
          email: user.email,
          fullName: `${user.name} ${user.lastname}`,
          groups: user?.groups.map((g) => g.name) || [],
          type: user.type,
          branchId: user.branchId,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenExpireIn, {
        refreshTokenId,
      }),
    ]);
    await this.redisService.insertRefreshToken(user.id, refreshTokenId);
    return { accessToken, refreshToken };
  }

  async getUserFromToken(token: string) {
    try {
      const payload: ActiveUserData = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );
      return payload;
    } catch (error) {
      return false;
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return this.jwtService.signAsync(
      {
        id: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        expiresIn,
      },
    );
  }

  async findAllPermissionsOfUser(userId: string): Promise<any[]> {
    return this.usersService.findAllPermissions(userId);
  }

  async verifyRecaptcha(body: any): Promise<boolean> {
    const secretKey = this.appConfigService.recaptchaSecretKey;

    const recaptchaUrl = `${this.appConfigService.recaptchaVerifyUrl}?secret=${secretKey}&response=${body['g-recaptcha-response']}`;

    try {
      const response = await firstValueFrom(this.httpService.get(recaptchaUrl));

      return response.data;
    } catch (error) {
      throw new CustomError(500, 'Internal Server Error');
    }
  }

  generateApiKey(length: number = 32): string {
    const buffer = randomBytes(length);
    const apiKey = buffer.toString('base64');
    const urlSafeApiKey = apiKey
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return urlSafeApiKey;
  }

  hashApiKey(apiKey: string): { salt: string; hash: string } {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(apiKey, salt, 100, 64, 'sha512').toString('hex');

    return { salt, hash };
  }

  async createApiKey(activeUser: ActiveUserData) {
    const apiKey = this.generateApiKey();
    const { salt, hash } = this.hashApiKey(apiKey);
    await this.usersService.updateById(activeUser.id, { apiKey: hash, salt });
    return apiKey;
  }
}
