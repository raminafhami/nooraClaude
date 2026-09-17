import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Personnel, PersonnelDocument } from '../schemas/personnel.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class PersonnelRepositoryImpl extends BaseRepositoryImpl<PersonnelDocument> {
  constructor(
    @InjectModel(Personnel.name)
    protected PersonnelModel: Model<PersonnelDocument>,
  ) {
    super(PersonnelModel);
  }

  async upsertData(userId: string, data: any) {
    return this.PersonnelModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          data,
        },
      },
      { upsert: true, new: true },
    );
  }
}
