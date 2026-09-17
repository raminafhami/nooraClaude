import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { GetQueryDto } from '../process-instances/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiBearerAuth('token')
@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERMISSION,
  })
  @Post()
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<any> {
    const permission = await this.permissionsService.create(
      createPermissionDto,
    );
    return permission;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERMISSION,
  })
  @Get()
  async getPermissions(@Query() queryDto: GetQueryDto) {
    const permissions = await this.permissionsService.findAll(queryDto);
    return permissions;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERMISSION,
  })
  @Get('actions')
  async getActions(): Promise<any> {
    return Object.values(PermissionAction);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERMISSION,
  })
  @Get('subjects')
  async getSubjects(): Promise<any> {
    return Object.values(Subjects);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERMISSION,
  })
  @Get(':id')
  async getPermissionById(@Param('id') id: string): Promise<any> {
    const permission = await this.permissionsService.findById(id);
    if (!permission) throw new BadRequestException('permission not exist.');
    return permission;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PERMISSION,
  })
  @Delete(':id')
  async deletePermission(@Param('id') id: string): Promise<any> {
    const checkDeleted = await this.permissionsService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('permission not exist');
    }
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERMISSION,
  })
  @Put(':id')
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<any> {
    const newPermission = await this.permissionsService.findByIdAndUpdate(
      id,
      updatePermissionDto,
    );

    if (!newPermission) throw new BadRequestException('permission  not exist.');
    return newPermission;
  }
}
