import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Query,
  Put,
} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('products category')
@ApiBearerAuth('token')
@Controller('products-category')
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PRODUCT_CATEGORY,
  })
  @Post()
  async create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    const productCategory = await this.productCategoryService.create(
      createProductCategoryDto,
    );
    return productCategory;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT_CATEGORY,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.productCategoryService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT_CATEGORY,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const productCategory = await this.productCategoryService.findById(id);
    if (!productCategory) {
      throw new NotFoundException('product category not exist');
    }
    return productCategory;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PRODUCT_CATEGORY,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    const newProductCategory =
      await this.productCategoryService.findByIdAndUpdate(
        id,
        updateProductCategoryDto,
      );
    if (!newProductCategory) {
      throw new NotFoundException('product category not exist');
    }
    return newProductCategory;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PRODUCT_CATEGORY,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.productCategoryService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('product category not exist');
    }
  }
}
