import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { FormAssignmentService } from './form-assignment.service';
import { FormResponseService } from './form-response.service';
import { FormShareService } from './form-share.service';
import { SaveResponseAnswersDto } from './dto/save-response-answers.dto';
import { FinalizeResponseDto } from './dto/finalize-response.dto';
import { CreateFormShareDto } from './dto/create-form-share.dto';
import { FormAnswerFileService } from './form-answer-file.service';
import { FormAnswerFileInterceptor } from './interceptors/form-answer-file.interceptor';

@ApiTags('form builder - employee workflow')
@ApiBearerAuth('token')
@Controller('form-builder')
export class FormResponseController {
  constructor(
    private readonly formAssignmentService: FormAssignmentService,
    private readonly formResponseService: FormResponseService,
    private readonly formShareService: FormShareService,
    private readonly formAnswerFileService: FormAnswerFileService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('me/assignments')
  async listMyAssignments(@ActiveUser() user: ActiveUserData) {
    return this.formAssignmentService.listMyAssignments(user.id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('assignments/:assignmentId/detail')
  async getMyAssignmentDetail(
    @Param('assignmentId') assignmentId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.formAssignmentService.getMyAssignmentDetail(
      assignmentId,
      user.id,
    );
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Post('assignments/:assignmentId/occurrence')
  async ensureRespondableOccurrence(
    @Param('assignmentId') assignmentId: string,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formAssignmentService.ensureRespondableOccurrence(
      assignmentId,
      user.id,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('occurrences/:occurrenceId/version')
  async getOccurrenceVersion(
    @Param('occurrenceId') occurrenceId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.formResponseService.getOccurrenceVersion(occurrenceId, user.id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('occurrences/:occurrenceId/response')
  async getResponse(
    @Param('occurrenceId') occurrenceId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.formResponseService.getResponse(occurrenceId, user.id);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Put('occurrences/:occurrenceId/response')
  async saveAnswers(
    @Param('occurrenceId') occurrenceId: string,
    @Body() dto: SaveResponseAnswersDto,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formResponseService.saveAnswers(
      occurrenceId,
      user.id,
      dto,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Post('occurrences/:occurrenceId/finalize')
  async finalizeResponse(
    @Param('occurrenceId') occurrenceId: string,
    @Body() dto: FinalizeResponseDto,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formResponseService.finalizeResponse(
      occurrenceId,
      user.id,
      user.fullName,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FormAnswerFileInterceptor)
  @Post('occurrences/:occurrenceId/files')
  async uploadAnswerFile(
    @Param('occurrenceId') occurrenceId: string,
    @UploadedFile() file: any,
    @Body('questionId') questionId: string,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formAnswerFileService.upload(
      occurrenceId,
      user.id,
      questionId,
      file,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Delete('occurrences/:occurrenceId/files/:fileId')
  async removeAnswerFile(
    @Param('occurrenceId') occurrenceId: string,
    @Param('fileId') fileId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    await this.formAnswerFileService.remove(occurrenceId, fileId, user.id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('occurrences/:occurrenceId/files/:fileId')
  async downloadAnswerFile(
    @Param('occurrenceId') occurrenceId: string,
    @Param('fileId') fileId: string,
    @ActiveUser() user: ActiveUserData,
    @Res() res: Response,
  ) {
    const file = await this.formAnswerFileService.getForOwner(
      occurrenceId,
      fileId,
      user.id,
    );
    return res.download(file.path, file.originalName);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('shares/:shareId/files/:fileId')
  async downloadSharedAnswerFile(
    @Param('shareId') shareId: string,
    @Param('fileId') fileId: string,
    @ActiveUser() user: ActiveUserData,
    @Res() res: Response,
  ) {
    const file = await this.formAnswerFileService.getForShare(
      shareId,
      fileId,
      user.id,
    );
    return res.download(file.path, file.originalName);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('occurrences/:occurrenceId/pdf/raw')
  async downloadRawFormPdf(
    @Param('occurrenceId') occurrenceId: string,
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { buffer, filename } =
      await this.formResponseService.generateRawFormPdf(occurrenceId, user.id);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('occurrences/:occurrenceId/pdf/completed')
  async downloadCompletedFormPdf(
    @Param('occurrenceId') occurrenceId: string,
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { buffer, filename } =
      await this.formResponseService.generateCompletedFormPdf(
        occurrenceId,
        user.id,
      );
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Post('occurrences/:occurrenceId/share')
  async shareResponse(
    @Param('occurrenceId') occurrenceId: string,
    @Body() dto: CreateFormShareDto,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formShareService.shareResponse(
      occurrenceId,
      user.id,
      dto,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('me/received-forms')
  async listReceivedShares(@ActiveUser() user: ActiveUserData) {
    return this.formShareService.listReceivedShares(user.id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('shares/:shareId')
  async getShareDetail(
    @Param('shareId') shareId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.formShareService.getShareDetail(shareId, user.id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_RESPONSE,
  })
  @Get('shares/:shareId/pdf')
  async downloadSharedFormPdf(
    @Param('shareId') shareId: string,
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { buffer, filename } =
      await this.formShareService.generateSharedCompletedPdf(shareId, user.id);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }
}
