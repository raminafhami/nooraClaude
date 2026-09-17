import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { PersonnelRequestService } from './personnel-request.service';
import { CreatePersonnelRequestDto } from './dto/create-personnel-request.dto';
import { UpdatePersonnelRequestDto } from './dto/update-personnel-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CustomMessages } from 'src/common/const/custom-messages';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { GetQueryDto } from '../../shared/crud/dto/get-query.dto';
import { ConfirmOrRejectPersonnelRequestsDto } from './dto/confirm-or-reject-personnel-requests.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiBearerAuth('token')
@Controller('personnel-request')
@ApiTags('personnel-request')
export class PersonnelRequestController {
  constructor(
    private readonly personnelRequestService: PersonnelRequestService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PERSONNEL_REQUEST,
  })
  @Post()
  async create(
    @Body() createPersonnelRequestDto: CreatePersonnelRequestDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return new CustomResponse(
      201,
      CustomMessages.CREATED,
      await this.personnelRequestService.createRequest(
        createPersonnelRequestDto,
        user,
      ),
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_REQUEST,
  })
  @Get()
  async findAll(@Query() getQueryDto: GetQueryDto) {
    return new CustomResponse(
      200,
      CustomMessages.VALUE_PREPARED,
      await this.personnelRequestService.findAll(getQueryDto),
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PERSONNEL_REQUEST,
  })
  @Get('get-my-requests')
  async findMyRequests(
    @Query() getQueryDto: GetQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const filter = JSON.parse(getQueryDto.filters || '{}');
    filter.userId = user.id;
    getQueryDto.filters = JSON.stringify(filter);
    return new CustomResponse(
      200,
      CustomMessages.VALUE_PREPARED,
      await this.personnelRequestService.findAll(getQueryDto),
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_REQUEST,
  })
  @Post('/confirm-or-reject-personnel-requests')
  async confirmOrRejectPersonnelRequests(
    @Body()
    confirmOrRejectPersonnelRequestsDto: ConfirmOrRejectPersonnelRequestsDto,
  ) {
    return await this.personnelRequestService.confirmOrRejectPersonnelRequests(
      confirmOrRejectPersonnelRequestsDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PERSONNEL_REQUEST,
  })
  @Delete(':requestId')
  async deleteRequest(
    @Param('requestId') requestId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return await this.personnelRequestService.deleteRequest(user, requestId);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PERSONNEL_REQUEST,
  })
  @Put(':requestId')
  async updateRequest(
    @Param('requestId') requestId: string,
    @ActiveUser() user: ActiveUserData,
    @Body() updateRequestDto: UpdatePersonnelRequestDto,
  ) {
    const personnelRequest =
      await this.personnelRequestService.findByIdAndUpdate(
        requestId,
        updateRequestDto,
      );
    if (!personnelRequest) {
      throw new NotFoundException('personnelRequestNotFound');
    }
    return personnelRequest;
  }
}
