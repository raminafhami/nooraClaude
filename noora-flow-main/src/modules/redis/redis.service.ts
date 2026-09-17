import { Inject, Injectable } from '@nestjs/common';

import { RedisPrefixEnum } from './redis.prefix.enum';
import { RedisRepository } from './repository/redis.repository';

const oneDayInSeconds = 60 * 60 * 24;
const oneHourInSeconds = 60 * 60;
const oneMinuteInSeconds = 60;

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}

  async existVerificationCode(phoneNo: string) {
    return this.redisRepository.exsits(
      RedisPrefixEnum.VERIFICATION_CODE,
      phoneNo,
    );
  }

  async existsDynamicVerificationCode(phoneNo: string, prefix: string) {
    return this.redisRepository.exsits(prefix, phoneNo);
  }

  async getTtl(prefix: string, key: string): Promise<number> {
    return await this.redisRepository.getTtl(prefix, key);
  }

  async setVerificationCode(phoneNo: string, code: string) {
    return this.redisRepository.setWithExpiry(
      RedisPrefixEnum.VERIFICATION_CODE,
      phoneNo,
      code,
      oneMinuteInSeconds * 2,
    );
  }

  async setVerificationDynamicPrefix(
    prefix: string,
    phoneNo: string,
    code: string,
  ) {
    return this.redisRepository.setWithExpiry(
      prefix,
      phoneNo,
      code,
      oneMinuteInSeconds * 2,
    );
  }

  async getVerificationCode(phoneNo: string) {
    return this.redisRepository.get(RedisPrefixEnum.VERIFICATION_CODE, phoneNo);
  }

  async getVerificationCodeDynamicPrefix(prefix: string, phoneNo: string) {
    return this.redisRepository.get(prefix, phoneNo);
  }

  async insertRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.redisRepository.sadd(
      RedisPrefixEnum.REFRESH_TOKEN,
      userId,
      tokenId,
    );
  }

  async validateRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<boolean> {
    const refreshTokens = await this.redisRepository.smembers(
      RedisPrefixEnum.REFRESH_TOKEN,
      userId,
    );
    return refreshTokens.includes(tokenId);
  }

  async invalidateRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.redisRepository.srem(
      RedisPrefixEnum.REFRESH_TOKEN,
      userId,
      tokenId,
    );
  }

  async getRefreshToken(userId: string) {
    return await this.redisRepository.smembers(
      RedisPrefixEnum.REFRESH_TOKEN,
      userId,
    );
  }

  async addDispatcherCode(codes: string[]) {
    return this.redisRepository.sadd(RedisPrefixEnum.DISPATCHER, 'COMPANY', [
      ...codes,
    ]);
  }

  async existDispatcherDomainCode(code: string): Promise<boolean> {
    const codes = await this.getAllDispatcherDomainCodes();
    return codes.includes(code);
  }

  async getAllDispatcherDomainCodes() {
    return this.redisRepository.smembers(RedisPrefixEnum.DISPATCHER, 'COMPANY');
  }

  async removeDispatcherDomainCode(codes: string[]): Promise<void> {
    await this.redisRepository.srem(RedisPrefixEnum.DISPATCHER, 'COMPANY', [
      ...codes,
    ]);
  }
}
