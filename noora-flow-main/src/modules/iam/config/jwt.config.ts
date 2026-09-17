import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessTokenExpireIn: parseInt(
    process.env.JWT_ACCESS_TOKEN_EXPIREIN ?? '3600',
    10,
  ),
  refreshTokenExpireIn: parseInt(
    process.env.JWT_REFRESH_TOKEN_EXPIREIN ?? '86400',
    10,
  ),
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  secret: process.env.JWT_SECRET,
}));
