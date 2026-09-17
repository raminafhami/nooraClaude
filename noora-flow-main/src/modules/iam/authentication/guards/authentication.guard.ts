import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthType } from '../enums/auth-type.enum';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { UsersService } from 'src/modules/users/services/users.service';
import { pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { UserDocument } from 'src/modules/users/schemas/user.schema';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeaders(request);
    const apiKey = this.extractApiKey(request);

    if (!token && !apiKey) {
      throw new UnauthorizedException();
    }

    if (apiKey) {
      await this.validateApiKey(apiKey, request);
      return true;
    }

    if (token) {
      await this.validateJwtToken(token, request);
      return true;
    }

    return false;
  }

  extractTokenFromHeaders(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return token;
  }

  extractApiKey(request: Request): string | undefined {
    // Check for API key in various places

    // 1. Check X-API-KEY header (common approach)
    const headerApiKey = request.headers['x-api-key'];
    if (headerApiKey) return headerApiKey.toString();

    // 2. Check authorization header with API-Key prefix
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'API-Key') return key;

    // 3. Check query parameter
    return request.query.apiKey?.toString();
  }

  private async validateJwtToken(
    token: string,
    request: Request,
  ): Promise<boolean> {
    try {
      const payload: ActiveUserData = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request[REQUEST_USER_KEY] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

  private async validateApiKey(
    apiKey: string,
    request: Request,
  ): Promise<void> {
    const users = await this.userService.findWithOutPagination(
      { isActive: true, apiKey: { $exists: true } },
      null,
      'apiKey salt branchId email name lastname groups phoneNo type',
    );

    const matchingKey = await this.findMatchingApiKey(users, apiKey);

    if (!matchingKey) {
      throw new UnauthorizedException('API key is not valid!');
    }

    const payload: ActiveUserData = {
      branchId: matchingKey.branchId,
      email: matchingKey.email,
      fullName: matchingKey.name + ' ' + matchingKey.lastname,
      groups: matchingKey.groups,
      id: matchingKey._id,
      phoneNo: matchingKey.phoneNo,
      type: matchingKey.type,
    };

    request[REQUEST_USER_KEY] = payload;
  }

  private async findMatchingApiKey(
    users: UserDocument[],
    providedApiKey: string,
  ) {
    const verificationPromises = users.map(async (user) => {
      try {
        const hash = pbkdf2Sync(
          providedApiKey,
          user.salt,
          100,
          64,
          'sha512',
        ).toString('hex');

        // Use constant-time comparison to prevent timing attacks
        const hashBuffer = Buffer.from(hash);
        const storedHashBuffer = Buffer.from(user.apiKey);

        if (
          hashBuffer.length === storedHashBuffer.length &&
          timingSafeEqual(hashBuffer, storedHashBuffer)
        ) {
          return user;
        }
      } catch (error) {
        throw new UnauthorizedException('Error checking API key');
      }
      return null;
    });
    const results = await Promise.all(verificationPromises);
    return results.find((result) => result !== null);
  }
}
