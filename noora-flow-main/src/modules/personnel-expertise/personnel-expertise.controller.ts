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
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { PersonnelExpertiseService } from './personnel-expertise.service';
import {
  CreatePersonnelExpertiseDto,
  CreatePersonnelExpertiseWithCertificateDto,
} from './dto/create-personnel-expertise.dto';
import { UpdatePersonnelExpertiseDto } from './dto/update-personnel-expertise.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { PersonnelExpertiseListDto } from './dto/create-personnel-expertise-bulk.dto';
import { UpdatePersonnelExpertiseListDto } from './dto/update-personnel-expertise-bulk.dto';
import {
  EditPersonnelCertificateDto,
  UploadPersonnelCertificateDto,
} from './dto/create-personnel-certificate.dto';
import { CertificateFileInterceptor } from './interceptors/certificate-file.interceptor';
import * as fs from 'fs';
import type { Response } from 'express';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';

@ApiTags('personnel-expertise')
@ApiBearerAuth('token')
@Controller('personnel-expertise')
export class PersonnelExpertiseController {
  constructor(
    private readonly personnelExpertiseService: PersonnelExpertiseService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Post()
  async create(
    @Body() createPersonnelExpertiseDto: CreatePersonnelExpertiseDto,
  ) {
    const p = await this.personnelExpertiseService.findOne({
      userId: createPersonnelExpertiseDto.userId,
      expertiseId: createPersonnelExpertiseDto.expertiseId,
    });
    if (p) {
      throw new BadRequestException('this personnel expertise is exist');
    }

    const pe = await this.personnelExpertiseService.create(
      createPersonnelExpertiseDto,
    );
    return pe;
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @ApiQuery({ name: 'userId', type: 'string', required: false })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(CertificateFileInterceptor)
  @Post('certificate')
  async createWithCertificate(
    @UploadedFile() file,
    @Body()
    createPersonnelExpertiseDto: CreatePersonnelExpertiseWithCertificateDto,
  ) {
    createPersonnelExpertiseDto.data =
      typeof createPersonnelExpertiseDto.data === 'string'
        ? JSON.parse(createPersonnelExpertiseDto.data)
        : createPersonnelExpertiseDto.data;
    const p = await this.personnelExpertiseService.findOne({
      userId: createPersonnelExpertiseDto.userId,
      expertiseId: createPersonnelExpertiseDto.expertiseId,
    });
    if (p) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('this personnel expertise is exist');
    }

    const certificate = await this.personnelExpertiseService.saveFile({
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      userId: createPersonnelExpertiseDto.userId,
      expertiseId: createPersonnelExpertiseDto.expertiseId,
      organizationName: createPersonnelExpertiseDto.organizationName,
      certificateDate: createPersonnelExpertiseDto.certificateDate,
    });
    createPersonnelExpertiseDto.data.certificateId = certificate.id;

    const pe = await this.personnelExpertiseService.create(
      createPersonnelExpertiseDto,
    );
    return pe;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Get('certificate/:certificateId')
  async showFile(
    @Param('certificateId') certificateId: string,
    @Res() res: Response,
  ) {
    const file = await this.personnelExpertiseService.getCertificate(
      certificateId,
    );
    if (!file) throw new NotFoundException('certificate not found');
    return res.download(file.path);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Post('bulk')
  async bulkCreate(@Body() { items }: PersonnelExpertiseListDto) {
    const result = await this.personnelExpertiseService.bulkCreate(items);

    return {
      insertedCount: result.insertedCount,
      upsertedCount: result.upsertedCount,
    };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Get()
  async findAll(@Query() query: GetQueryDto) {
    query.populate = 'data.certificate';
    const result = await this.personnelExpertiseService.findAll(query);
    return result;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const personnelEx = await this.personnelExpertiseService.findById(
      id,
      'data.certificate',
    );
    if (!personnelEx) {
      throw new NotFoundException('personnel expertise not exist.');
    }
    return personnelEx;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Put('bulk')
  async bulkUpdate(
    @ActiveUser() user: ActiveUserData,
    @Body() { items }: UpdatePersonnelExpertiseListDto,
  ) {
    const newPersonnelExs = await this.personnelExpertiseService.bulkUpdate(
      items,
      {
        modifyBy: user.id,
        modifyAt: new Date(),
      },
    );

    return { modifiedCount: newPersonnelExs.modifiedCount };
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
    @Body() updatePersonnelExpertiseDto: UpdatePersonnelExpertiseDto,
  ) {
    const newPersonnelEx =
      await this.personnelExpertiseService.findByIdAndUpdate(id, {
        ...updatePersonnelExpertiseDto,
        modifyBy: user.id,
        modifyAt: Date.now(),
      });

    if (!newPersonnelEx) {
      throw new NotFoundException('personnel expertise not exist.');
    }
    return newPersonnelEx;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.personnelExpertiseService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('personnel expertise not exist.');
    }
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @ApiConsumes('multipart/form-data')
  @Post(':id/certificate')
  @UseInterceptors(CertificateFileInterceptor)
  async uploadCertificateFile(
    @UploadedFile() file,
    @ActiveUser() user: ActiveUserData,

    @Param('id') id: string,
    @Body() uploadPersonnelCertificateDto: UploadPersonnelCertificateDto,
  ) {
    const PE = await this.personnelExpertiseService.findById(id);

    if (PE.data?.certificateId) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('certificate file already uploaded.');
    }
    const certificate = await this.personnelExpertiseService.saveFile({
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      userId: PE.userId,
      expertiseId: PE.expertiseId,
      ...uploadPersonnelCertificateDto,
    });

    const newPE = await this.personnelExpertiseService.findByIdAndUpdate(id, {
      'data.certificateId': certificate.id,
      status: 'qualified',
      modifyBy: user.id,
      modifyAt: Date.now(),
    });

    return newPE;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_EXPERTISE,
  })
  @Put(':id/certificate')
  async editCertificate(
    @Param('id') id: string,
    @Body() editPersonnelCertificateDto: EditPersonnelCertificateDto,
  ) {
    const PE = await this.personnelExpertiseService.findById(id);

    await this.personnelExpertiseService.updateCertificateFile(
      PE.data.certificateId,
      editPersonnelCertificateDto,
    );
  }
}
