import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  PersonnelExpertise,
  PersonnelExpertiseDocument,
} from '../schemas/personnel-expertise.schema';

@Injectable()
export class PersonnelExpertiseRepositoryImpl extends BaseRepositoryImpl<PersonnelExpertiseDocument> {
  constructor(
    @InjectModel(PersonnelExpertise.name)
    protected personnelExpertiseModel: Model<PersonnelExpertiseDocument>,
  ) {
    super(personnelExpertiseModel);
  }

  async bulkCreate(data: any, upsert: boolean) {
    let bulk;
    if (upsert) {
      bulk = bulk = data.map((item) => {
        return {
          updateOne: {
            filter: {
              expertiseId: item.expertiseId,
              userId: item.userId,
            },
            update: { $set: item },
            upsert: true,
          },
        };
      });
    } else {
      bulk = data.map((item) => {
        return { insertOne: { document: item } };
      });
    }

    return this.personnelExpertiseModel.bulkWrite(bulk);
  }
  async bulkUpdate(data: any, { modifyAt, modifyBy }: any) {
    const bulk = data.map((item) => {
      const _id = item.id;
      delete item.id;
      return {
        updateOne: {
          filter: { _id },
          update: {
            ...item,
            modifyAt,
            modifyBy,
          },
        },
      };
    });
    return this.personnelExpertiseModel.bulkWrite(bulk);
  }
}
