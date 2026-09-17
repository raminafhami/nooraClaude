import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { WorkingTimeRegulationsService } from './working-time-regulations.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateWorkingTimeRegulationDto } from './dto/create-working-time-regulation.dto';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { CustomMessages } from 'src/common/const/custom-messages';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('Working Time Regulation')
@ApiBearerAuth('token')
@Controller('working-time-regulations')
export class WorkingTimeRegulationsController {
  constructor(
    private readonly workingTimeRegulationService: WorkingTimeRegulationsService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.WORKING_TIME_REGULATION,
  })
  @Post()
  async createWorkingTimeRegulation(
    @Body() createWorkingTimeRegulationDto: CreateWorkingTimeRegulationDto,
  ): Promise<CustomError | CustomResponse> {
    const timeFormatRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
    if (
      !timeFormatRegex.test(createWorkingTimeRegulationDto.entryTime) ||
      !timeFormatRegex.test(createWorkingTimeRegulationDto.exitTime) ||
      !timeFormatRegex.test(createWorkingTimeRegulationDto.flexible)
    ) {
      throw new BadRequestException('invalid time format');
    }

    return new CustomResponse(
      201,
      CustomMessages.SUCCESS,
      await this.workingTimeRegulationService.createCreateWorkingTimeRegulation(
        createWorkingTimeRegulationDto,
      ),
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.WORKING_TIME_REGULATION,
  })
  @Get()
  async getWorkingTimeRegulations() {
    return await this.workingTimeRegulationService.getWorkingTimeRegulations();
  }
}
