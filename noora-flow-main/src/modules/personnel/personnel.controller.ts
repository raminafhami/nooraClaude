import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { PersonnelService } from './personnel.service';
import { PersonnelExpertiseService } from '../personnel-expertise/personnel-expertise.service';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { PopulateQueryDto } from 'src/shared/crud/dto/populate-query.dto';
import { CreatePersonnelWithUserDto } from './dto/create-personnel-with-user';
import { UsersService } from '../users/services/users.service';
import { User, UserTypes } from '../users/schemas/user.schema';
import { JobDescriptionService } from '../job-description/job-description.service';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';

@ApiTags('personnel')
@ApiBearerAuth('token')
@Controller('personnel')
export class PersonnelController {
  constructor(
    private personnelService: PersonnelService,
    private personnelExpertiseService: PersonnelExpertiseService,
    private usersService: UsersService,
    private jobDescriptionService: JobDescriptionService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL,
  })
  @Post()
  async create(
    @Body() createPersonnelDto: CreatePersonnelWithUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const { user } = await this.usersService.createUserByAdmin({
      ...createPersonnelDto.user,
      type: UserTypes.PERSONNEL,
      createdBy: activeUser.id,
    });
    delete createPersonnelDto.user;

    const data = await this.personnelService.create({
      ...createPersonnelDto,
      userId: user.id,
      createdBy: user.createdBy,
    });
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL,
  })
  @Get()
  async findAll(@Query() getQuery: GetQueryDto) {
    getQuery.populate = !getQuery.populate
      ? null
      : (getQuery.populate
          .split(',')
          .filter((p) => ['user', 'jobs', 'expertises'].includes(p))
          .map((p) => {
            let result;
            switch (p) {
              case 'user':
                result = {
                  path: 'user',
                  select:
                    '_id name lastname username nationalCode email phoneNo branchId',
                };
                break;
              case 'jobs':
                result = { path: 'jobs', select: '_id name metadata' };
                break;
              case 'expertises':
                result = { path: 'expertises' };
                break;
            }
            return result;
          }) as any);

    const filter = JSON.parse(getQuery.filters || '{}');

    if (filter?.expertiseId) {
      const userIds =
        await this.personnelExpertiseService.filterUserIdsByExpertiseId(
          filter.expertiseId,
        );
      delete filter.expertiseId;

      filter.userId = { $in: userIds };
    }

    if (filter?.jobName) {
      const jobIds = await this.jobDescriptionService.findByJobName(
        filter.jobName,
      );
      delete filter.jobName;
      filter.jobs = { $in: jobIds };
    }

    if (filter?.user) {
      const userIds = await this.usersService.filterUsers(filter.user);

      delete filter.user;
      if (filter.userId) {
        filter.userId = {
          $in: [...new Set(userIds.concat(filter.userId.$in))],
        };
      } else {
        filter.userId = { $in: userIds };
      }
    }
    getQuery.filters = JSON.stringify(filter);

    const data = await this.personnelService.findAll(getQuery);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL,
  })
  @Get(':userId')
  async findByUserId(
    @Param('userId') userId: string,
    @Query() query: PopulateQueryDto,
  ) {
    query.populate = !query.populate
      ? null
      : (query.populate
          .split(',')
          .filter((p) => ['user', 'jobs', 'expertises'].includes(p))
          .map((p) => {
            let result;
            switch (p) {
              case 'user':
                result = {
                  path: 'user',
                  select:
                    '_id name lastname username nationalCode email phoneNo branchId',
                };
                break;
              case 'jobs':
                result = { path: 'jobs', select: '_id name metadata' };
                break;
              case 'expertises':
                result = { path: 'expertises' };
                break;
            }
            return result;
          }) as any);

    const personnel = await this.personnelService.findOne(
      { userId },
      null,
      query.populate,
    );

    if (!personnel) {
      throw new NotFoundException('personnel not exist.');
    }

    return personnel;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL,
  })
  @Put(':userId')
  async updateByUserId(
    @Param('userId') userId: string,
    @Body() data: UpdatePersonnelDto,
  ) {
    const newPersonnel = await this.personnelService.findOneAndUpdate(
      { userId },
      data,
    );
    if (!newPersonnel) {
      throw new NotFoundException('personnel not exist.');
    }
    return newPersonnel;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PERSONNEL,
  })
  @Delete(':userId')
  async deleteByUserId(@Param('userId') userId: string) {
    const checkDeleted = await this.personnelService.deleteOne({ userId });
    if (!checkDeleted) throw new NotFoundException('personnel not exist.');
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL,
  })
  @Get(':userId/jobs/:jobId/expertises')
  async getCommonAndUnCommonExpertise(
    @Param('userId') userId: string,
    @Param('jobId') jobId: string,
  ) {
    const jobExpertises = await this.jobDescriptionService.findJobExpertises(
      jobId,
    );

    if (!jobExpertises) {
      return { common: [], unCommon: [] };
    }
    let PE: any = await this.personnelExpertiseService.findByUserAndExpertise(
      userId,
      jobExpertises.map((e) => e.id),
    );

    PE = PE.map((pe) => pe.toJSON());

    const common: any = PE.filter((pe) =>
      jobExpertises.map((e) => e.id).includes(pe.expertiseId.toString()),
    ).map((pe) => {
      const e = jobExpertises.find((ex) => ex.id == pe.expertiseId.toString());

      delete pe.expertiseId;
      pe.expertise = e;
      return pe;
    });

    const unCommon = jobExpertises.filter(
      (e) => !common.map((c) => c.expertise.id).includes(e.id),
    );
    return { common, unCommon };
  }
}
