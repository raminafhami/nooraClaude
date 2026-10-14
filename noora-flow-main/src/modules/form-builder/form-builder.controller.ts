import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { FormCategoryService } from './form-category.service';
import { FormService } from './form.service';
import { FormAssignmentService } from './form-assignment.service';
import { FormResponseService } from './form-response.service';
import { FormReportService } from './form-report.service';
import { FormAnswerFileService } from './form-answer-file.service';
import { CreateFormCategoryDto } from './dto/create-form-category.dto';
import { UpdateFormCategoryDto } from './dto/update-form-category.dto';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { UpsertFormVersionDto } from './dto/upsert-form-version.dto';
import { CreateFormAssignmentDto } from './dto/create-form-assignment.dto';
import { GetFormReportDto } from './dto/get-form-report.dto';

@ApiTags('form builder')
@ApiBearerAuth('token')
@Controller('form-builder')
export class FormBuilderController {
  constructor(
    private readonly formCategoryService: FormCategoryService,
    private readonly formService: FormService,
    private readonly formAssignmentService: FormAssignmentService,
    private readonly formResponseService: FormResponseService,
    private readonly formReportService: FormReportService,
    private readonly formAnswerFileService: FormAnswerFileService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('reports/occurrences')
  async getOccurrenceReport(@Query() query: GetFormReportDto) {
    return this.formReportService.getReport(query);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('reports/metrics')
  async getReportMetrics(@Query() query: GetFormReportDto) {
    return this.formReportService.getMetrics(query);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('reports/occurrences/:occurrenceId/detail')
  async getOccurrenceDetailAsAdmin(
    @Param('occurrenceId') occurrenceId: string,
  ) {
    return this.formResponseService.getOccurrenceDetailAsAdmin(occurrenceId);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('reports/occurrences/:occurrenceId/pdf')
  async downloadOccurrencePdfAsAdmin(
    @Param('occurrenceId') occurrenceId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { buffer, filename } =
      await this.formResponseService.buildCompletedPdfForOccurrence(
        occurrenceId,
      );
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('reports/occurrences/:occurrenceId/files/:fileId')
  async downloadAnswerFileAsAdmin(
    @Param('occurrenceId') occurrenceId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const file = await this.formAnswerFileService.getForAdmin(
      occurrenceId,
      fileId,
    );
    return res.download(file.path, file.originalName);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('categories')
  async findAllCategories() {
    return this.formCategoryService.findWithOutPagination(
      {},
      null,
      'title isSystem createdAt',
    );
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Post('categories')
  async createCategory(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateFormCategoryDto,
  ) {
    return this.formCategoryService.create({
      ...dto,
      createdBy: user.id,
    });
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateFormCategoryDto,
  ) {
    return this.formCategoryService.findByIdAndUpdate(id, dto);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.FORM_BUILDER,
  })
  @Delete('categories/:id')
  async removeCategory(@Param('id') id: string) {
    return this.formCategoryService.removeCategory(id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('forms')
  async findAllForms(@Query() query: GetQueryDto) {
    return this.formService.findAllForms(query);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Post('forms')
  async createForm(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateFormDto,
    @Req() req: any,
  ) {
    return this.formService.createForm(dto, user.id, req['mongoSession']);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('forms/:id')
  async findFormById(@Param('id') id: string) {
    return this.formService.findFormById(id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('forms/:id/pdf/raw')
  async downloadRawFormPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { buffer, filename } = await this.formService.generateRawFormPdf(id);
    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Put('forms/:id')
  async updateFormMeta(@Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this.formService.updateFormMeta(id, dto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Put('forms/:id/draft-version')
  async upsertDraftQuestions(
    @Param('id') id: string,
    @Body() dto: UpsertFormVersionDto,
  ) {
    return this.formService.upsertDraftQuestions(id, dto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('forms/:id/versions')
  async listVersions(@Param('id') id: string) {
    return this.formService.listVersions(id);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER,
  })
  @Get('forms/:id/versions/:versionId')
  async getVersionById(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
  ) {
    return this.formService.getVersionById(id, versionId);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Post('forms/:id/publish')
  async publishForm(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formService.publishForm(id, user.id, req['mongoSession']);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Post('forms/:id/new-version')
  async createNewDraftVersion(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formService.createNewDraftVersion(
      id,
      user.id,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER,
  })
  @Post('forms/:id/archive')
  async archiveForm(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.formService.archiveForm(id, user.id);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FORM_BUILDER_ASSIGNMENT,
  })
  @Post('forms/:id/assignments')
  async createAssignments(
    @Param('id') id: string,
    @Body() dto: CreateFormAssignmentDto,
    @ActiveUser() user: ActiveUserData,
    @Req() req: any,
  ) {
    return this.formAssignmentService.createAssignments(
      id,
      dto,
      user.id,
      req['mongoSession'],
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM_BUILDER_ASSIGNMENT,
  })
  @Get('forms/:id/assignments')
  async listAssignments(@Param('id') id: string) {
    return this.formAssignmentService.listAssignmentsForForm(id);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM_BUILDER_ASSIGNMENT,
  })
  @Post('assignments/:assignmentId/deactivate')
  async deactivateAssignment(
    @Param('assignmentId') assignmentId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.formAssignmentService.deactivateAssignment(
      assignmentId,
      user.id,
    );
  }
}
