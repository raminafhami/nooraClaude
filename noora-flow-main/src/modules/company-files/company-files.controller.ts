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
import { CompanyFilesService } from './company-files.service';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { Response } from 'express';
import { CompanyFileInterceptor } from './interceptors/company-file.interceptor';
import { CreateCompanyFileDto } from './dto/create-company-file.dto';
import { UpdateCompanyFileDto } from './dto/update-company-file.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('company-file')
@ApiBearerAuth('token')
@Controller('company-files')
export class CompanyFilesController {
  constructor(private readonly companyFilesService: CompanyFilesService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.COMPANY_FILES,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(CompanyFileInterceptor)
  @Post()
  async create(
    @UploadedFile() file,
    @Body() createCompanyFileDto: CreateCompanyFileDto,
  ) {
    const companyFile = await this.companyFilesService.create({
      ...createCompanyFileDto,
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
    });
    return companyFile;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COMPANY_FILES,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.projection = { mimetype: 0, path: 0, directory: 0 };
    const data = await this.companyFilesService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COMPANY_FILES,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const companyFile = await this.companyFilesService.findOne(
      { _id: id },
      { mimetype: 0, path: 0, directory: 0 },
    );
    if (!companyFile) {
      throw new NotFoundException('company file not exist');
    }
    return companyFile;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.COMPANY_FILES,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserFileDto: UpdateCompanyFileDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const newCompanyFile = await this.companyFilesService.findByIdAndUpdate(
      id,
      {
        ...updateUserFileDto,
      },
    );
    if (!newCompanyFile) {
      throw new NotFoundException('company file not exist');
    }
    return newCompanyFile;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.COMPANY_FILES,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const companyFile = await this.companyFilesService.findById(id);
    const checkDeleted = await this.companyFilesService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('company file not exist');
    }
    fs.unlinkSync(companyFile.path);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.COMPANY_FILES,
  })
  @Get(':id/file')
  async showFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.companyFilesService.findById(id);
    if (!file) throw new NotFoundException('company file not found');
    return res.download(file.path);
  }
}
