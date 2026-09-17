import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
  NotFoundException,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import {
  SetPermissionsDto,
  UpdateUserGroupDto,
} from './dto/update-user-group.dto';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PopulateQueryDto } from 'src/shared/crud/dto/populate-query.dto';

@ApiTags('user groups')
@Controller('user-groups')
@ApiBearerAuth('token')
export class UserGroupsController {
  constructor(private readonly userGroupsService: UserGroupsService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER_GROUP,
  })
  @Post()
  async create(@Body() createUserGroupDto: CreateUserGroupDto) {
    const userGroup = await this.userGroupsService.create(createUserGroupDto);
    return userGroup;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_GROUP,
  })
  @Get()
  async findAll(@Query() getQuery: GetQueryDto) {
    // getQuery.populate = 'parent children users';
    const userGroups = await this.userGroupsService.findAll(getQuery);
    return userGroups;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_GROUP,
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() { populate }: PopulateQueryDto,
  ) {
    const userGroup = await this.userGroupsService.findById(id, populate);
    if (!userGroup) {
      throw new NotFoundException('userGroup not exist.');
    }
    return userGroup;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_GROUP,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserGroupDto: UpdateUserGroupDto,
  ) {
    const newUserGroup = await this.userGroupsService.findByIdAndUpdate(
      id,
      updateUserGroupDto,
    );

    if (!newUserGroup) {
      throw new NotFoundException('userGroup not exist.');
    }
    return newUserGroup;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.USER_GROUP,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.userGroupsService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException(
        'userGroup not exist or problem in delete userGroup.',
      );
    }
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_GROUP,
  })
  @Put(':id/set-permissions')
  async setPermissions(
    @Param('id') id: string,
    @Body() setPermissionsDto: SetPermissionsDto,
  ) {
    const newUserGroup = await this.userGroupsService.findByIdAndUpdate(
      id,
      setPermissionsDto,
    );

    if (!newUserGroup) {
      throw new NotFoundException('userGroup not exist.');
    }
    return newUserGroup;
  }
}
