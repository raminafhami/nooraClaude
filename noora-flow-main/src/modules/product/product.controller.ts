import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AddStockItemDto, CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductHistoryService } from './product-history.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import {
  ChangeHistoryDataDto,
  CreateProductTransferBatchDto,
  CreateProductTransferDto,
} from './dto/product-history.dto';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { QueueService } from '../queue/queue.service';

@ApiTags('products')
@ApiBearerAuth('token')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productHistoryService: ProductHistoryService,
    private readonly queueService: QueueService,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.PRODUCT,
  })
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    if (createProductDto.startIndex > createProductDto.endIndex) {
      throw new BadRequestException('startIndex must lower than endIndex');
    }
    const product = await this.productService.create({
      ...createProductDto,
      stock: [
        {
          startIndex: createProductDto.startIndex,
          endIndex: createProductDto.endIndex,
          quantity: createProductDto.endIndex - createProductDto.startIndex + 1,
          counter: createProductDto.startIndex,
        },
      ],
    });
    return product;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    queryDto.populate = 'category';
    const { data, count } = await this.productService.findAll(queryDto);

    return {
      data: data.map((d) => {
        d = d.toJSON();
        delete d.stock;
        return d;
      }),
      count,
    };
  }

  @Get('low-stock')
  async getLowStock(
    @Query('page') page: number = 0,
    @Query('size') size: number = 10,
  ) {
    const populate = 'category';
    const data = await this.productService.findWithOutPagination(
      {
        $and: [
          { alertThreshold: { $exists: true } },
          { alertThreshold: { $ne: null } },
        ],
      },
      populate,
    );
    const jsonData = data.map((product) => product.toJSON());

    const lowStockProducts = jsonData.filter(
      (product: any) => product.stockQuantity <= product.alertThreshold,
    );

    const startIndex = page * size;
    const paginatedProducts = lowStockProducts.slice(
      startIndex,
      startIndex + size,
    );

    return {
      data: paginatedProducts,
      count: lowStockProducts.length,
    };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findById(id, 'category');
    if (!product) {
      throw new NotFoundException('product not exist');
    }
    return product;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PRODUCT,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const newProduct = await this.productService.findByIdAndUpdate(
      id,
      updateProductDto,
    );
    if (!newProduct) {
      throw new NotFoundException('product not exist');
    }
    return newProduct;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PRODUCT,
  })
  @Put(':id/add-stock')
  async updateStock(
    @Param('id') id: string,
    @Body() addStockItemDto: AddStockItemDto,
  ) {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException('product not exist');
    }
    const checkArr = product.stock.filter(
      (item) =>
        addStockItemDto.startIndex > item.endIndex ||
        addStockItemDto.endIndex < item.startIndex,
    );
    if (
      checkArr.length != product.stock.length ||
      addStockItemDto.startIndex > addStockItemDto.endIndex
    ) {
      throw new BadRequestException('you cant add this item.');
    }
    const newProduct = await this.productService.findByIdAndUpdate(id, {
      $push: {
        stock: {
          startIndex: addStockItemDto.startIndex,
          endIndex: addStockItemDto.endIndex,
          quantity: addStockItemDto.endIndex - addStockItemDto.startIndex + 1,
          counter: addStockItemDto.startIndex,
        },
      },
    });

    return newProduct;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PRODUCT,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const history = await this.productHistoryService.findOne(
      { productId: id },
      { _id: 1 },
    );
    if (history) {
      throw new BadRequestException('can not delete this product');
    }
    const checkDeleted = await this.productService.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('product not exist');
    }
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.PRODUCT,
  })
  @Delete(':id/stock/:stockId')
  async removeStock(
    @Param('id') id: string,
    @Param('stockId') stockId: string,
  ) {
    const product = await this.productService.findById(id);
    if (!product) {
      throw new NotFoundException('product not exist');
    }

    const stockItem = product.stock.find((item) => item['id'] == stockId);

    if (!stockItem) {
      throw new NotFoundException('product stock item not exist');
    }
    const history = await this.productHistoryService.findOne(
      {
        productId: id,
        from: { $gte: stockItem.startIndex },
        to: { $lte: stockItem.endIndex },
      },
      { _id: 1 },
    );

    if (history) {
      throw new BadRequestException('can not delete this product stock item');
    }
    await this.productService.updateById(id, {
      $pull: { stock: { _id: stockId } },
    });
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PRODUCT,
  })
  @Post(':id/transfer')
  async transferToBranch(
    @Param('id') id: string,
    @Body() createProductTransferDto: CreateProductTransferDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const product = await this.productService.findOneAndUpdate(
      {
        _id: id,
        'stock._id': createProductTransferDto.stockId,
        'stock.quantity': { $gte: createProductTransferDto.qty },
      },
      {
        $inc: {
          'stock.$.quantity': -createProductTransferDto.qty,
          'stock.$.counter': createProductTransferDto.qty,
        },
      },
    );

    if (!product) {
      throw new NotFoundException('product not exist or out of quantity');
    }
    const stockItem = product.stock.find(
      (item) => item['id'] == createProductTransferDto.stockId,
    );
    const from = stockItem.counter - createProductTransferDto.qty;
    const to = stockItem.counter - 1;
    const unUsedCodes = Array.from(
      { length: createProductTransferDto.qty },
      (_, i) => i + from,
    );
    const history = await this.productHistoryService.create({
      productId: id,
      branchId: createProductTransferDto.branchId,
      from,
      to,
      unUsedCodes,
      createdBy: user.id,
      quantity: createProductTransferDto.qty,
      description: createProductTransferDto.description,
    });

    let targetStock: number =
      product.stock?.reduce((total, elem) => total + elem.quantity, 0) || 0;

    if (product.alertThreshold && targetStock <= product.alertThreshold) {
      await this.queueService.warehouseQuantityAlert({
        quantity: targetStock,
        userId: user.id,
        productName: product.name,
      });
    }

    return history;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PRODUCT,
  })
  @Post(':id/transfer/batch')
  async transferToBranchBatch(
    @Param('id') id: string,
    @Body() createProductTransferDto: CreateProductTransferBatchDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    const product = await this.productService.findById(id);
    let remainingQuantity = createProductTransferDto.qty;
    const updateStock = [];
    product?.stock.forEach((s) => {
      if (remainingQuantity != 0 && s.quantity != 0) {
        if (s.quantity >= remainingQuantity) {
          updateStock.push({
            stockId: s['id'],
            transferQuantity: remainingQuantity,
          });
          remainingQuantity = 0;
        } else {
          updateStock.push({
            stockId: s['id'],
            transferQuantity: s.quantity,
          });
          remainingQuantity = remainingQuantity - s.quantity;
        }
      }
    });
    if (!product || remainingQuantity != 0) {
      throw new NotFoundException('product not exist or out of quantity');
    }

    const histories = await Promise.all(
      updateStock.map(async (sItem) => {
        const product = await this.productService.findOneAndUpdate(
          {
            _id: id,
            'stock._id': sItem.stockId,
          },
          {
            $inc: {
              'stock.$.quantity': -sItem.transferQuantity,
              'stock.$.counter': sItem.transferQuantity,
            },
          },
        );
        const stockItem = product.stock.find(
          (item) => item['id'] == sItem.stockId,
        );
        const from = stockItem.counter - sItem.transferQuantity;
        const to = stockItem.counter - 1;
        const unUsedCodes = Array.from(
          { length: sItem.transferQuantity },
          (_, i) => i + from,
        );
        const history = await this.productHistoryService.create({
          productId: id,
          branchId: createProductTransferDto.branchId,
          from,
          to,
          unUsedCodes,
          quantity: sItem.transferQuantity,
          description: createProductTransferDto.description,
          createdBy: user.id,
        });
        return history;
      }),
    );

    return { histories };
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT,
  })
  @Get('history/list')
  async getHistory(@Query() queryDto: GetQueryDto) {
    queryDto.populate = [
      { path: 'createdBy', select: '_id name lastname' },
      'branch',
      'product',
    ] as any;
    queryDto.projection = '-unUsedCodes';
    const data = await this.productHistoryService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT,
  })
  @Get('history/list-category/:categoryName/:branchId')
  async getListCategory(
    @Param('categoryName') categoryName: string,
    @Param('branchId') branchId: string,
  ) {
    const products = await this.productService.aggregate([
      {
        $lookup: {
          from: 'productcategories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
        },
      },
      {
        $match: {
          'category.name': categoryName,
        },
      },

      {
        $project: {
          _id: 1,
        },
      },
    ]);

    const histories = await this.productHistoryService.getListHistory(
      products.map((p) => p._id),
      branchId,
    );
    return histories;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT,
  })
  @Get('history/:historyId')
  async getOneHistory(@Param('historyId') id: string) {
    const history = await this.productHistoryService.findById(id, [
      { path: 'createdBy', select: '_id name lastname' },
      'branch',
      'product',
    ]);
    if (!history) {
      throw new NotFoundException('product history not found');
    }
    return history;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.PRODUCT,
  })
  @Put('history/products')
  async changeHistoryData(@Body() { historyItems }: ChangeHistoryDataDto) {
    await Promise.all(
      historyItems.map((item) => {
        return this.productHistoryService.updateMany(
          { productId: item.productId },
          {
            $pull: {
              unUsedCodes: { $in: item.usedCodes },
            },
          },
        );
      }),
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.PRODUCT,
  })
  @Get(':productId/check-branch/:code')
  async findBrach(@Param('productId') id: string, @Param('code') code: number) {
    const history = await this.productHistoryService.findOne(
      {
        productId: id,
        from: { $lte: code },
        to: { $gte: code },
      },
      null,
      'branch',
    );
    if (!history) {
      throw new NotFoundException('this code not found in product');
    }

    return {
      ...history.toJSON().branch,
      codeIsUsed: !history.unUsedCodes.includes(code),
    };
  }
}
