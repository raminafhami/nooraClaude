import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  NotFoundException,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { UserFilesService } from './user-files.service';
import { CreateUserFileDto } from './dto/create-user-file.dto';
import {
  UpdateUserFileStatusDto,
  UpdateUserFileTitleDto,
} from './dto/update-user-file.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { UsersService } from '../users/services/users.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import { UserFileInterceptor } from './interceptors/user-file.interceptor';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { Response } from 'express';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiTags('user-file')
@ApiBearerAuth('token')
@Controller('user-files')
export class UserFilesController {
  constructor(
    private readonly userFilesService: UserFilesService,
    private readonly usersService: UsersService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.USER_FILE,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(UserFileInterceptor)
  @Post(':userId')
  async create(
    @UploadedFile() file,
    @Body() createUserFileDto: CreateUserFileDto,
    @ActiveUser() user: ActiveUserData,
    @Param('userId') userId: string,
  ) {
    const resUser = await this.usersService.findById(userId);
    if (!resUser) {
      fs.unlinkSync(file.path);
      throw new NotFoundException('user not exist.');
    }
    const userFile = await this.userFilesService.create({
      ...createUserFileDto,
      userId,
      createBy: user.id,
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
    });
    return userFile;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_FILE,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.projection = { mimetype: 0, path: 0, filename: 0, directory: 0 };
    const data = await this.userFilesService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_FILE,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const userFile = await this.userFilesService.findOne(
      { _id: id },
      { mimetype: 0, path: 0, filename: 0, directory: 0 },
    );
    if (!userFile) {
      throw new NotFoundException('user file not exist');
    }
    return userFile;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_FILE,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserFileDto: UpdateUserFileTitleDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const newUserFile = await this.userFilesService.findByIdAndUpdate(id, {
      ...updateUserFileDto,
      modifyBy: user.id,
      modifyAt: Date.now(),
    });
    if (!newUserFile) {
      throw new NotFoundException('user file not exist');
    }
    return newUserFile;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.USER_FILE,
  })
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateUserFileDto: UpdateUserFileStatusDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const newUserFile = await this.userFilesService.findByIdAndUpdate(id, {
      ...updateUserFileDto,
      modifyBy: user.id,
      modifyAt: Date.now(),
    });
    if (!newUserFile) {
      throw new NotFoundException('user file not exist');
    }
    return newUserFile;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.USER_FILE,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const userFile = await this.userFilesService.findById(id);
    const checkDeleted = await this.userFilesService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('user file not exist');
    }
    fs.unlinkSync(userFile.path);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.USER_FILE,
  })
  @Get(':id/file')
  async showFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.userFilesService.findById(id);
    if (!file) throw new NotFoundException('user file not found');
    return res.download(file.path);
  }
}
