import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  Put,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { UserRelationsService } from './user-relations.service';
import { CreateUserRelationDto } from './dto/create-user-relation.dto';
import { UpdateUserRelationDto } from './dto/update-user-relation.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { PopulateQueryDto } from 'src/shared/crud/dto/populate-query.dto';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { HttpStatusCode } from 'axios';

@ApiTags('user-relations')
@ApiBearerAuth('token')
@Controller('user-relations')
export class UserRelationsController {
  constructor(private readonly userRelationsService: UserRelationsService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER_RELATIONS,
  })
  @Post()
  async create(@Body() createUserRelationDto: CreateUserRelationDto) {
    if (
      !createUserRelationDto.coordinatorId &&
      !createUserRelationDto.marketerId
    ) {
      throw new BadRequestException(
        'you must provide at least one of coordinatorId or marketerId',
      );
    }
    await this.userRelationsService.findOneAndUpdate(
      {
        userId: createUserRelationDto.userId,
        deactivatedAt: null,
      },
      {
        deactivatedAt: new Date(),
      },
    );
    const userRelations = await this.userRelationsService.create(
      createUserRelationDto,
    );
    return userRelations;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_RELATIONS,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.userRelationsService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_RELATIONS,
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query() { populate }: PopulateQueryDto,
  ) {
    const userRelations = await this.userRelationsService.findById(
      id,
      populate,
    );
    if (!userRelations) {
      throw new NotFoundException('user-relations not exist');
    }
    return userRelations;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_RELATIONS,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserRelationDto: UpdateUserRelationDto,
  ) {
    if (
      !updateUserRelationDto.coordinatorId &&
      !updateUserRelationDto.marketerId
    ) {
      throw new BadRequestException(
        'you must provide at least one of coordinatorId or marketerId',
      );
    }
    const newUserRelations = await this.userRelationsService.findOneAndUpdate(
      { _id: id, deactivatedAt: null },
      updateUserRelationDto,
    );
    if (!newUserRelations) {
      throw new NotFoundException('user-relations not exist or is not active');
    }
    return newUserRelations;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.USER_RELATIONS,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.userRelationsService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('user-relations not exist');
    }
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_RELATIONS,
  })
  @Get('user/:userId')
  async findOneWithUserId(
    @Param('userId') userId: string,
    @Query() { populate }: PopulateQueryDto,
  ) {
    const userRelations = await this.userRelationsService.findWithOutPagination(
      { userId },
      populate,
    );
    if (!userRelations) {
      throw new NotFoundException('user-relations not exist');
    }
    return userRelations;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_RELATIONS,
  })
  @Get('user/:userId/current')
  async findOneActive(@Param('userId') userId: string) {
    const userRelations = await this.userRelationsService.findOne(
      { userId, deactivatedAt: null },
      null,
      'marketer coordinator',
    );
    if (!userRelations) {
      return new CustomResponse(
        HttpStatusCode.NotFound,
        'user-relations not found',
        null,
      );
      // throw new NotFoundException('user-relations not exist');
    }
    return userRelations;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_RELATIONS,
  })
  @Patch(':id/deactive')
  async deactive(@Param('id') id: string) {
    const userRelation = await this.userRelationsService.findById(id);
    if (!userRelation.deactivatedAt) {
      await this.userRelationsService.updateById(id, {
        deactivatedAt: new Date(),
      });
      return { success: true };
    }
    return userRelation;
  }
}
