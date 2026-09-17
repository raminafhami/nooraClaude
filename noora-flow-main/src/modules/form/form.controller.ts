import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { UsersService } from '../users/services/users.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { IndicatorService } from '../indicator/indicator.service';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiTags('form and submission')
@ApiBearerAuth('token')
@Controller('forms')
export class FormController {
  constructor(
    private readonly formService: FormService,
    private readonly usersService: UsersService,
    private readonly indicatorService: IndicatorService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.FORM,
  })
  @Post()
  async create(@Body() createFormDto: CreateFormDto) {
    const userIds = await this.usersService.filterUsers({
      groups: { $in: createFormDto.groups },
    });

    const formNo = await this.indicatorService.findByKeyAndIncrement(
      createFormDto.indicatorKey,
    );

    delete createFormDto.groups;
    delete createFormDto.indicatorKey;

    const form = await this.formService.create({
      ...createFormDto,
      targetUsers: userIds.map((id) => ({ userId: id, isSubmitted: false })),
      formNo,
    });

    return form;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.projection = '-targetUsers';
    queryDto.populate = 'evalUser';
    const data = await this.formService.findAll(queryDto);

    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.FORM,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const form = await this.formService.findById(
      id,
      'targetUsers.user targetUsers.submission',
    );
    if (!form) {
      throw new NotFoundException('form not exist');
    }
    return form;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.FORM,
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    const keys = Object.keys(updateFormDto);
    const submissionIsExist = await this.formService.submissionExist(id);
    if (submissionIsExist && !keys.includes('endDate') && keys.length != 1) {
      throw new BadRequestException('can not update this form');
    }

    if (updateFormDto?.groups) {
      const userIds = await this.usersService.filterUsers({
        groups: { $in: updateFormDto.groups },
      });
      delete updateFormDto.groups;
      updateFormDto = {
        ...updateFormDto,
        targetUsers: userIds.map((id) => ({ userId: id, isSubmitted: false })),
      } as any;
    }
    const newForm = await this.formService.findByIdAndUpdate(id, updateFormDto);
    if (!newForm) {
      throw new NotFoundException('form not exist');
    }
    return newForm;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.FORM,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const submissionExist = await this.formService.canDeleteForm(id);
    if (submissionExist) {
      throw new BadRequestException('cant delete this form.');
    }
    const checkDeleted = await this.formService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('form not exist.');
    }
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.SUBMISSION,
  })
  @Post(':id/submission')
  async submitForm(
    @ActiveUser() user: ActiveUserData,
    @Param('id') id: string,
    @Body() createSubmissionDto: CreateSubmissionDto,
  ) {
    const submission = await this.formService.submitForm(
      user.id,
      id,
      createSubmissionDto,
    );

    return submission;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SUBMISSION,
  })
  @Get('me/result')
  async findUserSubmissionResult(
    @ActiveUser() user: ActiveUserData,
    @Query() queryDto: GetQueryDto,
  ) {
    const filter = JSON.parse(queryDto.filters || '{}');
    filter.userId = user.id;
    queryDto.filters = JSON.stringify(filter);
    queryDto.projection = 'formId avgScore status';
    queryDto.populate = 'form';
    const data = await this.formService.userSubmissions(queryDto);
    return data;
  }
}
