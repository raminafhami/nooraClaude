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
import { IndicatorService } from './indicator.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('indicator')
@ApiBearerAuth('token')
@Controller('indicator')
export class IndicatorController {
  constructor(private readonly indicatorService: IndicatorService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.INDICATOR,
  })
  @Post()
  async create(@Body() createIndicatorDto: CreateIndicatorDto) {
    const indicator = await this.indicatorService.create(createIndicatorDto);
    return indicator;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INDICATOR,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.indicatorService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INDICATOR,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const indicator = await this.indicatorService.findById(id);
    if (!indicator) {
      throw new NotFoundException('indicator not exist');
    }
    return indicator;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INDICATOR,
  })
  @Get('key/:key')
  async getCodeByKey(@Param('key') key: string) {
    const indicatorCode = await this.indicatorService.findByKeyAndIncrement(
      key,
    );

    return indicatorCode;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.INDICATOR,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
  ) {
    const newIndicator = await this.indicatorService.findByIdAndUpdate(
      id,
      updateIndicatorDto,
    );
    if (!newIndicator) {
      throw new NotFoundException('indicator not exist');
    }
    return newIndicator;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.INDICATOR,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.indicatorService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('indicator not exist');
    }
  }
}
