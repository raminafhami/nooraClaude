import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Headers,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateProcessDefinitionDto,
  UpdateProcessDefinitionDto,
  GetProcessDefinitionDto,
  UpdateDefinitionParams,
  StageDefinition,
  GetProcessDefinitionQueryDto,
} from './dtos';
import { ProcessDefinitionService } from './process-definitions.service';
import { UpdateStageBody, UpdateStageParams } from './dtos/update-stage.dto';
import { CommonHeadersDto } from 'src/shared/dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerMemoryOptions, multerOptions } from './providers/multer-options';
import CustomError from 'src/common/providers/custom-error';
import CustomResponse from 'src/common/providers/custom-response.service';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { CustomMessages } from 'src/common/const/custom-messages';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiBearerAuth('token')
@ApiTags('Business Process Definitions')
@Controller('process-definitions')
export class ProcessDefinitionController {
  constructor(private processDefinitionService: ProcessDefinitionService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @ActiveUser() user: ActiveUserData,
    @Body() createProcessDefinitionDto: CreateProcessDefinitionDto,
  ): Promise<CustomResponse | CustomError> {
    const { data, newVersion } = await this.processDefinitionService.create(
      createProcessDefinitionDto,
    );
    if (newVersion) {
      return new CustomResponse(
        HttpStatus.OK,
        CustomMessages.WORKFLOW_CREATED_NEW_VERSION,
        data,
      );
    } else {
      return new CustomResponse(
        HttpStatus.CREATED,
        CustomMessages.WORKFLOW_CREATED,
        data,
      );
    }
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Get('/list')
  async findAll(
    @ActiveUser() user: ActiveUserData,
    @Query() getProcessDefinitionDto: GetProcessDefinitionDto,
  ): Promise<CustomResponse | CustomError> {
    const result = await this.processDefinitionService.findAll(
      getProcessDefinitionDto,
      user,
    );
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, {
      ...result,
    });
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Get(':processDefinitionId')
  async findOne(
    @ActiveUser() user: ActiveUserData,
    @Param('processDefinitionId') id: string,
  ): Promise<CustomResponse | CustomError> {
    const data = await this.processDefinitionService.findOne(id);

    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, data);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Get('key/:key')
  async findOneByKey(
    @ActiveUser() user: ActiveUserData,
    @Param('key') key: string,
    @Query() query: GetProcessDefinitionQueryDto,
  ): Promise<CustomResponse | CustomError> {
    const data = await this.processDefinitionService.findOneByKey(key, query);
    return new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, data);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Put(':processDefinitionId')
  async updateOne(
    @ActiveUser() user: ActiveUserData,
    @Param('processDefinitionId') id: string,
    @Body() updateProcessDefinitionDto: UpdateProcessDefinitionDto,
  ): Promise<CustomResponse | CustomError> {
    const data = await this.processDefinitionService.update(
      id,
      updateProcessDefinitionDto,
    );
    return new CustomResponse(
      HttpStatus.OK,
      CustomMessages.WORKFLOW_UPDATED,
      data,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Put(':processDefinitionId/stages/:stageId')
  async updateStage(
    @ActiveUser() user: ActiveUserData,
    @Param() params: UpdateStageParams,
    @Body() stage: UpdateStageBody,
  ): Promise<CustomResponse | CustomError> {
    return this.processDefinitionService.updateStage(params, stage);
  }

  // @Post('upload-connector')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //       serviceName: {
  //         type: 'string',
  //       },
  //     },
  //   },
  // })
  // @UseInterceptors(FileInterceptor('file', multerOptions))
  // uploadPROTOFile(
  //   @ActiveUser() user: ActiveUserData,
  //   @UploadedFile() file: any,
  // ) {
  //   return this.processDefinitionService.uploadProtoFile(file);
  // }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PROCESS_DEFINITION,
  })
  @Post('upload-bpmn')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerMemoryOptions))
  async uploadBPMNFile(
    @ActiveUser() user: ActiveUserData,
    @UploadedFile() file: any,
  ) {
    const { data, newVersion } =
      await this.processDefinitionService.uploadBPMNFile(file);
    if (newVersion) {
      return new CustomResponse(
        HttpStatus.OK,
        CustomMessages.WORKFLOW_CREATED_NEW_VERSION,
        data,
      );
    } else {
      return new CustomResponse(
        HttpStatus.CREATED,
        CustomMessages.WORKFLOW_CREATED,
        data,
      );
    }
  }

  @Get('all/records')
  async getAllProcessDefinitions(@Query() query: GetProcessDefinitionDto) {
    return await this.processDefinitionService.allProcessDefinitions(query);
  }
}
