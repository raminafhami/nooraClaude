import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

@ApiTags('form builder - employee workflow')
@ApiBearerAuth('token')
@Controller('form-builder')
export class FormResponseController {
  constructor(
    private readonly formAssignmentService: FormAssignmentService,
    private readonly formResponseService: FormResponseService,
    private readonly formShareService: FormShareService,
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
