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
} from '@nestjs/common';
import { JobDescriptionService } from './job-description.service';
import { CreateJobDescriptionDto } from './dto/create-job-description.dto';
import { UpdateJobDescriptionDto } from './dto/update-job-description.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiTags('job-description')
@ApiBearerAuth('token')
@Controller('job-description')
export class JobDescriptionController {
  constructor(private readonly jobDescriptionService: JobDescriptionService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.JOB_DESCRIPTION,
  })
  @Post()
  async create(@Body() createJobDescriptionDto: CreateJobDescriptionDto) {
    const jobDescription = await this.jobDescriptionService.create(
      createJobDescriptionDto,
    );
    return jobDescription;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.JOB_DESCRIPTION,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    return this.jobDescriptionService.findAll(queryDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.JOB_DESCRIPTION,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const jobDes = await this.jobDescriptionService.findById(id, 'ex');
    if (!jobDes) {
      throw new NotFoundException('job description not exist');
    }
    return jobDes;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.JOB_DESCRIPTION,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDescriptionDto: UpdateJobDescriptionDto,
  ) {
    const newJobDes = await this.jobDescriptionService.findByIdAndUpdate(
      id,
      updateJobDescriptionDto,
    );
    if (!newJobDes) {
      throw new NotFoundException('job description not exist');
    }
    return newJobDes;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.JOB_DESCRIPTION,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.jobDescriptionService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('job description not exist');
    }
  }
}
