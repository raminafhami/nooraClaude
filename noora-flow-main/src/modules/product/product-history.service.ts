import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ProductHistoryDocument } from './schemas/product-history.schema';
import { ProductHistoryRepositoryImpl } from './repository/product-history.repository';

@Injectable()
export class ProductHistoryService extends CrudService<ProductHistoryDocument> {
  constructor(
    private readonly productHistoryRepositoryImpl: ProductHistoryRepositoryImpl,
  ) {
    super(productHistoryRepositoryImpl);
  }

  async getListHistory(productIds: string[], branchId: string) {
    const histories = await this.productHistoryRepositoryImpl.model
      .find({
        productId: { $in: productIds },
        branchId,
      })
      .populate('productId');

    const groupByProduct = histories.reduce((group, history) => {
      const { productId } = history;
      group[productId['id']] = group[productId['id']] ?? {};
      if (Object.keys(group[productId['id']]).length != 0) {
        group[productId['id']].unUsedCodes = group[
          productId['id']
        ].unUsedCodes.concat(history.unUsedCodes);
      } else {
        group[productId['id']] = {
          unUsedCodes: history.unUsedCodes,
          productName: productId['name'],
          productId: productId['id'],
        };
      }

      return group;
    }, {});
    return Object.values(groupByProduct);
  }
}
