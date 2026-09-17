import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailController } from './email.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './schemas/email.schema';
import { EmailRepositoryImpl } from './repository/email.repository';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailConfigService } from 'src/config/email/config.service';
import { EmailConfigModule } from 'src/config/email/config.module';
import { IamModule } from '../iam/iam.module';
import { UsersModule } from '../users/users.module';
import { EmailGateway } from './email.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
    BullModule.registerQueue({
      name: 'email',
      // Limited to 1 email per second
      limiter: {
        max: 1,
        duration: 1000 * 1,
      },
    }),
    MailerModule.forRootAsync({
      imports: [EmailConfigModule],
      useFactory: (emailConfigService: EmailConfigService) => {
        return {
          transport: {
            host: emailConfigService.host,
            port: emailConfigService.port,
            secure: emailConfigService.secure,
            auth: {
              user: emailConfigService.username,
              pass: emailConfigService.password,
            },
          },
        };
      },
      inject: [EmailConfigService],
    }),
    IamModule,
    UsersModule,
    EmailConfigModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor, EmailRepositoryImpl, EmailGateway],
  exports: [EmailService],
})
export class EmailModule {}
