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
} from '@nestjs/common';
import { SamplingPriceService } from './sampling-price.service';
import {
  AddPricesListDto,
  CreateSamplingPriceDto,
} from './dto/create-sampling-price.dto';
import { UpdateSamplingPriceDto } from './dto/update-sampling-price.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';

@ApiTags('sampling-price')
@ApiBearerAuth('token')
@Controller('sampling-price')
export class SamplingPriceController {
  constructor(private readonly samplingPriceService: SamplingPriceService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Post()
  async create(@Body() createSamplingPriceDto: CreateSamplingPriceDto) {
    const samplingPrice = await this.samplingPriceService.create({
      ...createSamplingPriceDto,
      pricesList: [],
    });
    return samplingPrice;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.samplingPriceService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const samplingPrice = await this.samplingPriceService.findById(id);
    if (!samplingPrice) {
      throw new NotFoundException('sampling price not exist');
    }
    return samplingPrice;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSamplingPriceDto: UpdateSamplingPriceDto,
  ) {
    const newSamplingPrice = await this.samplingPriceService.findByIdAndUpdate(
      id,
      updateSamplingPriceDto,
    );
    if (!newSamplingPrice) {
      throw new NotFoundException('sampling price not exist');
    }
    return newSamplingPrice;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Put(':id/prices-list')
  async updatePricesList(
    @Param('id') id: string,
    @Body() addPricesListDto: AddPricesListDto,
  ) {
    const samplingPrice = await this.samplingPriceService.findById(id);
    if (!samplingPrice) {
      throw new NotFoundException('sampling price not exist');
    }
    const findPrice = samplingPrice.pricesList.find(
      (elem) => elem.amount === addPricesListDto.amount,
    );

    if (findPrice) {
      return await this.samplingPriceService.findOneAndUpdate(
        { _id: id, 'pricesList.amount': addPricesListDto.amount },
        {
          $set: { 'pricesList.$.price': addPricesListDto.price },
        },
      );
    } else {
      return await this.samplingPriceService.findByIdAndUpdate(id, {
        $push: {
          pricesList: {
            price: addPricesListDto.price,
            amount: addPricesListDto.amount,
          },
        },
      });
    }
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.samplingPriceService.softDeleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('sampling price not exist');
    }
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.SAMPLING_PRICE,
  })
  @Delete(':id/price-list/:pricesListId')
  async removePricesList(
    @Param('id') id: string,
    @Param('pricesListId') pricesListId: string,
  ) {
    const samplingPrice = await this.samplingPriceService.findById(id);
    if (!samplingPrice) {
      throw new NotFoundException('sampling price not exist');
    }

    const pricesListItem = samplingPrice.pricesList.find(
      (item) => item['id'] == pricesListId,
    );

    if (!pricesListItem) {
      throw new NotFoundException('sampling price pricesList item not exist');
    }

    await this.samplingPriceService.updateById(id, {
      $pull: { pricesList: { _id: pricesListId } },
    });
  }
}
