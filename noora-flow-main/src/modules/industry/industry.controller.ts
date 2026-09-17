import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { GetQueryDto } from '../process-instances/dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IndustryService } from './industry.service';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiBearerAuth('token')
@ApiTags('industry')
@Controller('industry')
export class IndustryController {
  constructor(private industryService: IndustryService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.INDUSTRY,
  })
  @Post()
  async createIndustry(
    @Body() createIndustryDto: CreateIndustryDto,
  ): Promise<any> {
    const { parentId, type, name } = createIndustryDto;

    const invalidIndustry = await this.industryService.findOne({
      _id: parentId,
      type: 'sub',
    });
    if (invalidIndustry) {
      throw new BadRequestException(
        'could not create child for sub-industry !',
      );
    }

    const industry = await this.industryService.findOne({ name, type });
    if (industry) {
      throw new BadRequestException('industry is exist !');
    }

    return await this.industryService.create(createIndustryDto);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.INDUSTRY,
  })
  @Get()
  async getIndustry(@Query() queryDto: GetQueryDto) {
    const industry = await this.industryService.findAll(queryDto);
    return industry;
  }
}
