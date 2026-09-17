import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, Put, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/modules/iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from 'src/modules/iam/authentication/interfaces/active-user-data.interface';
import { PermissionAction, Subjects } from 'src/modules/iam/authentication/enums';
import { CheckPermissions } from 'src/modules/iam/authentication/decorators/permissions.decorator';

@ApiTags('comments')
@Controller('comments')
@ApiBearerAuth('token')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) { }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.COMMENTS,
  })
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @ActiveUser() activeUser: ActiveUserData) {

    const comments = await this.commentsService.create(
      { ...createCommentDto, createdBy: activeUser.id },
    );
    return comments;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COMMENTS,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.commentsService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COMMENTS,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comments = await this.commentsService.findById(id);
    if (!comments) {
      throw new NotFoundException('comments not exist');
    }
    return comments;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.COMMENTS,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @ActiveUser() activeUser: ActiveUserData
  ) {

    const comment = await this.commentsService.findById(id)
    if (comment.createdBy != activeUser.id) {
      throw new ForbiddenException("You are not able to delete this task")
    }
    const newComments =
      await this.commentsService.findByIdAndUpdate(
        id,
        { ...updateCommentDto, modifiedAt: new Date(), modifiedBy: activeUser.id },
      );
    if (!newComments) {
      throw new NotFoundException('comments not exist');
    }
    return newComments;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.COMMENTS,
  })
  @Delete(':id')
  async delete(@Param('id') id: string, @ActiveUser() activeUser: ActiveUserData) {
    const comment = await this.commentsService.findById(id)

    if (comment.createdBy != activeUser.id) {
      throw new ForbiddenException("You are not able to delete this task")
    }
    const checkDeleted = await this.commentsService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('comments not exist');
    }
  }
}
