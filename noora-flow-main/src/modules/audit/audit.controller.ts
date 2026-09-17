import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssetRequirementService } from '../asset-requirement/asset-requirement.service';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { UsersService } from '../users/services/users.service';
import { UserGroupsService } from '../user-groups/user-groups.service';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';

@ApiTags('audit')
@ApiBearerAuth('token')
@Controller('audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly assetRequirementService: AssetRequirementService,
    private readonly usersService: UsersService,
    private readonly userGroupsService: UserGroupsService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.AUDIT,
  })
  @Post()
  async create(@Body() createAuditDto: CreateAuditDto) {
    const audit = await this.auditService.create(createAuditDto);
    await this.assetRequirementService.create({
      parent: null,
      auditId: audit.id,
      paraNumber: '',
      questionDescription: `ROOT#${audit.title}`,
    });
    return audit;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.AUDIT,
  })
  @Get()
  async findAll(
    @ActiveUser() user: ActiveUserData,
    @Query() queryDto: GetQueryDto,
  ) {
    if (queryDto.populate) {
      queryDto.populate += ' producer seconder approver';
    } else {
      queryDto.populate = 'producer seconder approver';
    }

    const filter = JSON.parse(queryDto.filters || '{}');
    // filter.userGroups = {
    //   $elemMatch: {
    //     name: { $in: user.groups ?? [] },
    //   },
    // };
    queryDto.filters = JSON.stringify(filter);

    const data = await this.auditService.getAudits(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.AUDIT,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const audit = await this.auditService.findById(
      id,
      'producer seconder approver',
    );
    if (!audit) {
      throw new NotFoundException('audit not exist');
    }
    return audit;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.AUDIT,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAuditDto: UpdateAuditDto,
  ) {
    const newAudit = await this.auditService.findByIdAndUpdate(
      id,
      updateAuditDto,
    );
    if (!newAudit) {
      throw new NotFoundException('audit not exist');
    }
    return newAudit;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.AUDIT,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const asset = await this.assetRequirementService.findOne({
      auditId: id,
      parent: null,
    });
    if (asset?.children?.length >= 1) {
      throw new NotFoundException('you can not delete this audit');
    }
    const checkDeleted = await this.auditService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('audit not exist.');
    }
    await this.assetRequirementService.deleteById(asset.id);
  }
}
