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
import { ExpertiseService } from './expertise.service';
import { CreateExpertiseDto } from './dto/create-expertise.dto';
import { UpdateExpertiseDto } from './dto/update-expertise.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('expertise')
@ApiBearerAuth('token')
@Controller('expertise')
export class ExpertiseController {
  constructor(private readonly expertiseService: ExpertiseService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.EXPERTISE,
  })
  @Post()
  async create(@Body() createExpertiseDto: CreateExpertiseDto) {
    const data = await this.expertiseService.create(createExpertiseDto);
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
  }
}
