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
} from '@nestjs/common';
import { DispatcherCategoryService } from './dispatcher-category.service';
import {
  CreateDispatcherCategoryDto,
  DispatcherCodesDto,
} from './dto/create-dispatcher-category.dto';
import { UpdateDispatcherCategoryDto } from './dto/update-dispatcher-category.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { GetQueryDto } from '../process-instances/dtos';
import { RedisService } from '../redis/redis.service';
import { AppConfigService } from 'src/config/app/config.service';
import { DispatcherCategoryDocument } from './schemas/dispatcher-category.schema';

@ApiTags('dispatcher-category')
@ApiBearerAuth('token')
@Controller('dispatcher-category')
export class DispatcherCategoryController {
  constructor(
    private readonly dispatcherCategoryService: DispatcherCategoryService,
    private readonly redisService: RedisService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Post('company')
  async addCode(@Body() { codes }: DispatcherCodesDto) {
    await this.redisService.addDispatcherCode(codes);
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Get('company')
  async getAllCodes() {
    const codes = await this.redisService.getAllDispatcherDomainCodes();
    return codes;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Get('company/:code')
  async existCode(@Param('code') code: string) {
    const isExist = await this.redisService.existDispatcherDomainCode(code);
    return { isExist };
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Delete('company')
  async removeCode(@Body() { codes }: DispatcherCodesDto) {
    await this.redisService.removeDispatcherDomainCode(codes);
  }

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Post()
  async create(
    @Body() createDispatcherCategoryDto: CreateDispatcherCategoryDto,
  ) {
    const dispatcherCategory = await this.dispatcherCategoryService.create(
      createDispatcherCategoryDto,
    );
    return dispatcherCategory;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.dispatcherCategoryService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dispatcherCategory = await this.dispatcherCategoryService.findById(
      id,
    );
    if (!dispatcherCategory) {
      throw new NotFoundException('dispatcherCategory not exist');
    }
    return dispatcherCategory;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Get('code/:code')
  async getCategoriesByCode(@Param('code') code: string) {
    if (!/^\d{8}$/.test(code)) {
      throw new BadRequestException('The code must be 8 digits long!');
    }
    const categories = await this.dispatcherCategoryService.categorizeCode(
      code,
    );

    const companyDispatcherType = this.appConfigService.companyDispatcherType;

    const category = categories.find((c) => c.type == companyDispatcherType);
    let existInYourDomainCode = false;
    if (category?.domainCode) {
      existInYourDomainCode = await this.redisService.existDispatcherDomainCode(
        category.domainCode,
      );
    }

    return {
      categories,
      existInYourDomainCode,
    };
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDispatcherCategoryDto: UpdateDispatcherCategoryDto,
  ) {
    const newDispatcherCategory =
      await this.dispatcherCategoryService.findByIdAndUpdate(
        id,
        updateDispatcherCategoryDto,
      );
    if (!newDispatcherCategory) {
      throw new NotFoundException('dispatcherCategory not exist');
    }
    return newDispatcherCategory;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.DISPATCHER_CATEGORY,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.dispatcherCategoryService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('dispatcherCategory not exist');
    }
  }

  @Post('test/este/test')
  async fixCodes() {
    const codes: DispatcherCategoryDocument[] =
      await this.dispatcherCategoryService.findWithOutPagination({});
    for (let element of codes) {
      let excludes = element.exclude || [];
      excludes = excludes.map((code) => '^' + code);
      let includes = element.include || [];
      includes = includes.map((code) => '^' + code);
      const newElement = {
        ...element.toObject(),
        exclude: excludes,
        include: includes,
      };
      await this.dispatcherCategoryService.findByIdAndUpdate(
        element._id,
        newElement,
      );
    }
  }
}
