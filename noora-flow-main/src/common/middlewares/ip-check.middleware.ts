/* eslint-disable prefer-const */
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { isArray } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import CustomError from '../providers/custom-error';
import { CustomMessages } from '../const/custom-messages';

@Injectable()
export class IpCheck implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let validIps = process.env.ALLOWED_IPS_PERSONNEL.split(',');
    console.log('ValidIps:', validIps);

    let clientIp = req.headers['x-real-ip'];
    console.log('ClientIP:', clientIp);

    if (
      !clientIp ||
      validIps.includes(clientIp.toString()) ||
      isIPIn192_168_Range(clientIp.toString())
    ) {
      return next();
    }
    throw new CustomError(HttpStatus.UNAUTHORIZED, CustomMessages.FORBIDDEN);
  }
}

function isIPIn192_168_Range(ip) {
  // Split the IP address into octets
  const octets = ip.split('.');

  // Check if it has 4 octets
  if (octets.length !== 4) {
    return false;
  }

  // Check if the first two octets are 192 and 168
  if (octets[0] === '192' && octets[1] === '168') {
    return true;
  }

  return false;
}
