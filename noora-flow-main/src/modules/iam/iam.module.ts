import { Module, forwardRef } from '@nestjs/common';
import { HashingService } from './hashing-and-encryption/hashing.service';
import { BcryptService } from './hashing-and-encryption/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/modules/iam/config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { ConfigModule } from '@nestjs/config';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RedisConfigModule } from 'src/config/database/redis/config.module';
import { PermissionsGuard } from './authentication/guards/permissions.guard';
import { CaslAbilityFactory } from './authentication/factories/casl-ability.factory';
import { SmsModule } from '../sms/sms.module';
import { RedisModule } from '../redis/redis.module';
import { AppConfigModule } from 'src/config/app/config.module';
import { HttpModule } from '@nestjs/axios';
import { EncryptionService } from './hashing-and-encryption/encryption.service';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    SmsModule,
    RedisModule,
    AppConfigModule,
    HttpModule,
  ],
  providers: [
    { provide: HashingService, useClass: BcryptService },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    AccessTokenGuard,
    AuthenticationGuard,
    AuthenticationService,
    RefreshTokenIdsStorage,
    CaslAbilityFactory,
    EncryptionService,
  ],
  controllers: [AuthenticationController],
  exports: [HashingService, AuthenticationService, EncryptionService],
})
export class IamModule {}
