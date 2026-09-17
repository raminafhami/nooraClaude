import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger';
import { ValidationPipe } from '@nestjs/common';
import { OtherExceptionFilter } from './common/filters/other-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { UnauthorizedExceptionFilter } from './common/filters/unauthorized-exception.filter';
import { ResponseInterceptors } from './common/interceptors/response.interceptors';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerAuthGuard } from './common/guards/swagger-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useBodyParser('json', { limit: '100mb' });
  app.useBodyParser('urlencoded', { limit: '100mb', extended: true });
  // for class transformer { transform: true }
  // for remove dummy field in dto { whitelist: true }
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.useGlobalInterceptors(new ResponseInterceptors());

  // The last one has the highest priority!
  app.useGlobalFilters(new OtherExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  app.use('/api_doc', (req, res, next) => {
    const guard = new SwaggerAuthGuard();
    const canActivate = guard.canActivate({
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    } as any);

    if (canActivate) {
      next(); // Continue to Swagger if authenticated
    }
  });

  setupSwagger(app);
  await app.listen(+process.env.APP_PORT);
}
bootstrap();
