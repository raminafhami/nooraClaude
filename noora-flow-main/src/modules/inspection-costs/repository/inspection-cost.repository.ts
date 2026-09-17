import { Injectable } from '@nestjs/common';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  InspectionCost,
  InspectionCostDocument,
  InspectionCostStatus,
} from '../schemas/inspection-cost.schema';

@Injectable()
export class InspectionCostRepositoryImpl extends BaseRepositoryImpl<InspectionCostDocument> {
  constructor(
    @InjectModel(InspectionCost.name)
    protected inspectionCostsModel: Model<InspectionCostDocument>,
  ) {
    super(inspectionCostsModel);
  }

  async bulkUpdate(data: any, session?: ClientSession) {
    const bulk = data.map((item) => {
      const _id = item.id;
      return {
        updateOne: {
          filter: { _id },
          update: {
            total: item.total,
          },
        },
      };
    });
    if (session) return this.inspectionCostsModel.bulkWrite(bulk, { session });
    return this.inspectionCostsModel.bulkWrite(bulk);
  }

  async bulkUpdatePaymentVoucher(data: any) {
    const bulk = data.map((item) => {
      const _id = item.id;
      return {
        updateOne: {
          filter: { _id },
          update: {
            $push: { 'payment.vouchers': item.vouchers },
            $set: {
              status: InspectionCostStatus.PAID,
            },
          },
        },
      };
    });
    return this.inspectionCostsModel.bulkWrite(bulk);
  }
}
