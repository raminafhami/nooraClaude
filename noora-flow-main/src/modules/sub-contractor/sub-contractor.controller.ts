import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { SubContractorService } from './sub-contractor.service';
import { CreateSubContractorDto } from './dto/create-sub-contractor.dto';
import { UpdateSubContractorDto } from './dto/update-sub-contractor.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SubContractorFileInterceptor } from './interceptors/sub-contractor-file.interceptor';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import * as fs from 'fs';
import { Response } from 'express';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('sub-contractor')
@ApiBearerAuth('token')
@Controller('sub-contractor')
export class SubContractorController {
  constructor(private readonly subContractorService: SubContractorService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.SUB_CONTRACTOR,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SubContractorFileInterceptor)
  @Post()
  async create(
    @UploadedFile() file,
    @Body() createSubContractorDto: CreateSubContractorDto,
  ) {
    const subContractor = await this.subContractorService.create({
      ...createSubContractorDto,
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
    });
    return subContractor;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SUB_CONTRACTOR,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.projection = { mimetype: 0, path: 0, directory: 0 };
    const data = await this.subContractorService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SUB_CONTRACTOR,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const subContractor = await this.subContractorService.findOne(
      { _id: id },
      { mimetype: 0, path: 0, directory: 0 },
    );
    if (!subContractor)
      throw new NotFoundException('sub contractor not exist.');
    return subContractor;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.SUB_CONTRACTOR,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubContractorDto: UpdateSubContractorDto,
  ) {
    const newSubcontractor = await this.subContractorService.findByIdAndUpdate(
      id,
      updateSubContractorDto,
    );

    if (!newSubcontractor)
      throw new NotFoundException('sub contractor not exist.');
    return newSubcontractor;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.SUB_CONTRACTOR,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const subContractorFile = await this.subContractorService.findById(id);
    const checkDeleted = await this.subContractorService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('sub contractor not exist');
    }
    fs.unlinkSync(subContractorFile.path);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SUB_CONTRACTOR,
  })
  @Get(':id/file')
  async showFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.subContractorService.findById(id);
    if (!file) throw new NotFoundException('sub contractor not found');
    return res.download(file.path);
  }
}
