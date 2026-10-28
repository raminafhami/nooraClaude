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
  ConflictException,
} from '@nestjs/common';
import { ExpertiseService } from './expertise.service';
import { CreateExpertiseDto } from './dto/create-expertise.dto';
import { UpdateExpertiseDto } from './dto/update-expertise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { JobExpertiseSyncService } from '../job-description/job-expertise-sync.service';

const DUPLICATE_MESSAGE = 'این توانمندی با همین نوع و عنوان قبلاً ثبت شده است.';

@ApiTags('expertise')
@ApiBearerAuth('token')
@Controller('expertise')
export class ExpertiseController {
  constructor(
    private readonly expertiseService: ExpertiseService,
    private readonly jobExpertiseSyncService: JobExpertiseSyncService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.EXPERTISE,
  })
  @Post()
  async create(@Body() createExpertiseDto: CreateExpertiseDto) {
    const same = await this.expertiseService.findSameItem(
      createExpertiseDto.type,
      createExpertiseDto.title,
    );
    if (same) throw new ConflictException(DUPLICATE_MESSAGE);
    const data = await this.expertiseService.create({
      ...createExpertiseDto,
      title: createExpertiseDto.title?.trim(),
    });
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.EXPERTISE,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const result = await this.expertiseService.findAll(queryDto);
    return result;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.EXPERTISE,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const expertise = await this.expertiseService.findById(id);
    if (!expertise) {
      throw new NotFoundException('expertise not exist');
    }
    return expertise;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.EXPERTISE,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpertiseDto: UpdateExpertiseDto,
  ) {
    const current = await this.expertiseService.findById(id);
    if (!current) {
      throw new NotFoundException('expertise not exist');
    }
    if (updateExpertiseDto.title !== undefined || updateExpertiseDto.type !== undefined) {
      const same = await this.expertiseService.findSameItem(
        updateExpertiseDto.type ?? current.type,
        updateExpertiseDto.title ?? current.title,
        id,
      );
      if (same) throw new ConflictException(DUPLICATE_MESSAGE);
    }
    const newExpertise = await this.expertiseService.findByIdAndUpdate(
      id,
      updateExpertiseDto,
    );
    if (!newExpertise) {
      throw new NotFoundException('expertise not exist');
    }
    return newExpertise;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.EXPERTISE,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.expertiseService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('expertise not exist');
    }
    await this.jobExpertiseSyncService.trySync(`expertise ${id} deleted`, () =>
      this.jobExpertiseSyncService.removeExpertiseFromJobs(id),
    );
  }
}
