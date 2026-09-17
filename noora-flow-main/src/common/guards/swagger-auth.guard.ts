import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as basicAuth from 'basic-auth';

@Injectable()
export class SwaggerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const user = basicAuth(request);

    // Define your username and password here or use environment variables
    const validUser = process.env.SWAGGER_USERNAME;
    const validPassword = process.env.SWAGGER_PASSWORD;

    if (!user || user.name !== validUser || user.pass !== validPassword) {
      // Set the WWW-Authenticate header to trigger the browser's login prompt
      response.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
      response.status(401).send({
        statusCode: 401,
        message: 'You are not authorized to access this API.',
      });
      return false;
    }
    return true;
  }
}
