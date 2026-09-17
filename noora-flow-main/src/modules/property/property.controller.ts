import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  NotFoundException,
  Query,
  Patch,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { PropertyService } from './property.service';
import {
  CreatePropertyDto,
  UploadPropertyFileDto,
} from './dto/create-property.dto';
import { UpdatePropertyDto, UserProperyDto } from './dto/update-property.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import {
  DecommissionPropertyDto,
  MaintenanceRecordDto,
  RepairRecordDto,
} from './dto/maintenance-and-repair-record.dto';
import { PropertyFileInterceptor } from './interceptors/property-file.interceptor';
import { Response } from 'express';
import * as fs from 'node:fs/promises';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';

@ApiTags('property')
@ApiBearerAuth('token')
@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROPERTY,
  })
  @Post()
  async create(
    @ActiveUser() activeUser: ActiveUserData,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    const property = await this.propertyService.create({
      ...createPropertyDto,
      createdBy: activeUser.id,
    });
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROPERTY,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.propertyService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROPERTY,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const property = await this.propertyService.findById(id);
    if (!property) throw new NotFoundException('property not exist.');
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const newProperty = await this.propertyService.findByIdAndUpdate(
      id,
      updatePropertyDto,
    );

    if (!newProperty) throw new NotFoundException('property not exist.');
    return newProperty;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @Post(':id/assign')
  async assignToUsers(
    @Param('id') id: string,
    @Body() { userId }: UserProperyDto,
  ) {
    const data = await this.propertyService.assignUser(id, userId);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @Post(':id/unassign')
  async unassignFromUsers(@Param('id') id: string) {
    const data = await this.propertyService.unassignUser(id);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @Post(':id/maintenance')
  async addMaintenance(
    @Param('id') id: string,
    @Body() record: MaintenanceRecordDto,
  ) {
    const property = await this.propertyService.addMaintenanceRecord(
      id,
      record,
    );
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @Post(':id/maintenance/:maintenanceId/complete')
  async completeMaintenance(
    @Param('id') id: string,
    @Param('maintenanceId') maintenanceId: string,
  ) {
    const property = await this.propertyService.completeMaintenance(
      id,
      maintenanceId,
    );
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @Post(':id/repairs')
  async addRepair(@Param('id') id: string, @Body() record: RepairRecordDto) {
    const property = await this.propertyService.addRepairRecord(id, record);
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PROPERTY,
  })
  @Post(':id/decommission')
  async decommission(
    @Param('id') id: string,
    @Body() dto: DecommissionPropertyDto,
  ) {
    const property = await this.propertyService.decommissionProperty(id, dto);
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROPERTY,
  })
  @Get(':id/lifecycle')
  async getLifecycleReport(@Param('id') id: string) {
    const property = await this.propertyService.getLifecycleReport(id);
    if (!property) throw new NotFoundException('property not exist.');
    return property;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PROPERTY,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.propertyService.deletePropertyWithFiles(id);
    if (!checkDeleted) {
      throw new NotFoundException('property not exist');
    }
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROPERTY,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(PropertyFileInterceptor)
  @Post(':id/file')
  async addFileToAsset(
    @UploadedFile() file,
    @Body()
    uploadPropertyFileDto: UploadPropertyFileDto,
    @Param('id') id: string,
  ) {
    const property = await this.propertyService.findById(id);
    if (!property) {
      await fs.unlink(file.path);
      throw new NotFoundException('property requirement not exist.');
    }

    const propertyFile = await this.propertyService.saveFile({
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      title: uploadPropertyFileDto.title,
      propertyId: property.id,
    });
    await this.propertyService.updateById(property.id, {
      $addToSet: {
        files: propertyFile.id,
      },
    });
    return propertyFile;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROPERTY,
  })
  @Get(':fileId/show')
  async showFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const file = await this.propertyService.getFile(fileId);
    if (!file) throw new NotFoundException('property file not found');
    return res.download(file.path);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PROPERTY,
  })
  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    await this.propertyService.deletePropertyFile(fileId);
  }
}
