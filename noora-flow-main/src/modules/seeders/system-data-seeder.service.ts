import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from '../categories/entity/category.schema';
import { Indicator } from '../indicator/schemas/indicator.schema';
import {
  USER_GROUP_TYPE,
  UserGroup,
} from '../user-groups/schemas/user-group.schema';
import {
  systemCategories,
  systemIndicators,
  systemUserGroups,
} from './seeder-data';

/**
 * Creates the records the code looks up by a fixed key (financial categories,
 * counters, groups). Idempotent: existing records are never changed, except
 * that a category with the same type and code but no key gets the key.
 */
@Injectable()
export class SystemDataSeederService {
  private readonly logger = new Logger(SystemDataSeederService.name);

  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Indicator.name)
    private readonly indicatorModel: Model<Indicator>,
    @InjectModel(UserGroup.name)
    private readonly userGroupModel: Model<UserGroup>,
  ) {}

  async seedSystemData(): Promise<string[]> {
    const created: string[] = [];

    for (const category of systemCategories) {
      if (await this.categoryModel.exists({ key: category.key })) continue;

      const sameCode = await this.categoryModel.findOne({
        type: category.type,
        code: category.code,
      });
      if (sameCode) {
        await this.categoryModel.updateOne(
          { _id: sameCode._id },
          { $set: { key: category.key } },
        );
        created.push(`category key ${category.key}`);
        continue;
      }

      await this.categoryModel.create(category);
      created.push(`category ${category.key}`);
    }

    for (const indicator of systemIndicators) {
      if (await this.indicatorModel.exists({ key: indicator.key })) continue;

      await this.indicatorModel.create(indicator);
      created.push(`indicator ${indicator.key}`);
    }

    for (const group of systemUserGroups) {
      if (await this.userGroupModel.exists({ name: group.name })) continue;

      await this.userGroupModel.create({
        ...group,
        type: USER_GROUP_TYPE.ROLE,
        permissions: [],
      });
      created.push(`group ${group.name}`);
    }

    this.logger.log(
      created.length
        ? `System data created: ${created.join(', ')}`
        : 'System data already present - nothing to do.',
    );
    return created;
  }
}
