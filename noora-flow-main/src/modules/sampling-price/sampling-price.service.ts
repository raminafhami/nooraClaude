import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CategoryTypes } from 'src/common/const/enums';
import { CategoryService } from '../categories/category.service';
import { SamplingPriceRepositoryImpl } from './repository/sampling-price.repository';
import { SamplingPriceDocument } from './schemas/sampling-price.schema';

// income category the sampling forms record their fee under
export const SAMPLING_INCOME_CATEGORY_KEY = 'sampling';

@Injectable()
export class SamplingPriceService extends CrudService<SamplingPriceDocument> {
  constructor(
    private readonly samplingPriceRepository: SamplingPriceRepositoryImpl,
    private readonly categoryService: CategoryService,
  ) {
    super(samplingPriceRepository);
  }

  /**
   * Services offered on `date` (in `processKey` when given), each with the
   * price in force on that date.
   */
  async getEffectivePrices(date: Date, processKey?: string) {
    const filter: Record<string, any> = {
      isDeleted: false,
      $or: [{ deprecatedFrom: null }, { deprecatedFrom: { $gt: date } }],
    };
    if (processKey) {
      filter.$and = [
        { $or: [{ processKeys: { $size: 0 } }, { processKeys: processKey }] },
      ];
    }

    const list = await this.samplingPriceRepository.model
      .find(filter)
      .sort({ title: 1 });

    return list
      .map((service) => {
        const version = [...(service.prices || [])]
          .filter((p) => new Date(p.effectiveFrom) <= date)
          .sort(
            (a, b) =>
              new Date(b.effectiveFrom).getTime() -
              new Date(a.effectiveFrom).getTime(),
          )[0];

        if (!version) return null;

        return {
          id: service.id,
          title: service.title,
          price: version.price,
          priceId: version['id'],
          effectiveFrom: version.effectiveFrom,
        };
      })
      .filter(Boolean);
  }

  async getIncomeCategory() {
    return this.categoryService.findOne({
      type: CategoryTypes.Income,
      key: SAMPLING_INCOME_CATEGORY_KEY,
      isDeleted: false,
    });
  }

  async upsertIncomeCategory(title: string) {
    const category = await this.categoryService.findOne({
      type: CategoryTypes.Income,
      key: SAMPLING_INCOME_CATEGORY_KEY,
    });

    if (category) {
      return this.categoryService.findByIdAndUpdate(category._id, {
        title,
        isDeleted: false,
      });
    }

    return this.categoryService.create({
      type: CategoryTypes.Income,
      title,
      code: SAMPLING_INCOME_CATEGORY_KEY,
      key: SAMPLING_INCOME_CATEGORY_KEY,
    });
  }
}
