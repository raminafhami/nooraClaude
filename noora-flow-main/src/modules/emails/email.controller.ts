import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from '../users/services/users.service';
import { ConfigureEmailDto } from './dto/configure-email.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { Response } from 'express';
import { EmailQueryDto } from './dto/email-query.dto';
import { ReplyEmailDto } from './dto/reply-email.dto';
import { ForwardEmailDto } from './dto/forward-email.dto';

@ApiTags('emails')
@ApiBearerAuth('token')
@Controller('emails')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.EMAILS,
  })
  @Get('folders')
  async listFolders(@ActiveUser() activeUser: ActiveUserData) {
    const folders = await this.emailService.listFolders(activeUser.id);
    return folders;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.EMAILS,
  })
  @Get('folders/:folder')
  async fetchInbox(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('folder') folder: string,
    @Query() emailQueryDto: EmailQueryDto,
  ) {
    const data = await this.emailService.fetchEmails(
      activeUser.id,
      folder,
      emailQueryDto,
    );
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.EMAILS,
  })
  @Put('folders/:folder/messages/:messageUid/seen')
  async toggleSeen(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('messageUid') messageUid: string,
    @Param('folder') folder: string,
    @Query('seen') seen: string,
  ) {
    await this.emailService.toggleSeen(
      activeUser.id,
      Number(messageUid),
      folder,
      seen === 'true',
    );
    return {
      success: true,
      message: `Email marked as ${seen === 'true' ? 'read' : 'unread'}`,
    };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.EMAILS,
  })
  @Get('attachments/:messageUid/:attachmentIndex')
  async downloadAttachment(
    @ActiveUser() activeUser: ActiveUserData,
    @Param('messageUid') messageUid: string,
    @Param('attachmentIndex') attachmentIndex: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, info } = await this.emailService.getAttachment(
      activeUser.id,
      Number(messageUid),
      attachmentIndex,
    );

    res.set({
      'Content-Type': info.contentType,
      'Content-Disposition': `attachment; filename="${info.filename}"`,
      'Content-Length': info.size,
    });

    return new StreamableFile(stream);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.EMAILS,
  })
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @Post('reply')
  async replyEmail(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles() files: any,
    @Body() replyEmailDto: ReplyEmailDto,
  ) {
    this.emailService.replyEmail(activeUser.id, replyEmailDto, files);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.EMAILS,
  })
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @Post('forward')
  async forwardEmail(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles() files: any,
    @Body() forwardEmailDto: ForwardEmailDto,
  ) {
    this.emailService.forwardEmail(activeUser.id, forwardEmailDto, files);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.EMAILS,
  })
  @Post('configure')
  async configureEmail(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() config: ConfigureEmailDto,
  ) {
    await this.usersService.configureEmail(activeUser.id, config);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.EMAILS,
  })
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @Post('send')
  async sendEmail(
    @ActiveUser() activeUser: ActiveUserData,
    @UploadedFiles() files: any,
    @Body() sendEmailDto: SendEmailDto,
  ) {
    if (sendEmailDto.isUserEmail) {
      this.emailService.sendingUserEmail(activeUser.id, sendEmailDto, files);
    } else {
      this.emailService.sendingSystemEmail(activeUser.id, sendEmailDto, files);
    }
  }
}
