import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FormOccurrenceRepositoryImpl } from './repository/form-occurrence.repository';
import { FormOccurrenceStatus } from './schemas/form-occurrence.schema';
import { GetFormReportDto } from './dto/get-form-report.dto';

const USER_PROJECTION = {
  id: '$_id',
  _id: 1,
  name: 1,
  lastname: 1,
  username: 1,
};

@Injectable()
export class FormReportService {
  constructor(
    private readonly formOccurrenceRepositoryImpl: FormOccurrenceRepositoryImpl,
  ) {}

  // Shared between the listing and the metrics aggregation so a manager's
  // filters (category/form/completer/date range/status) always narrow both
  // consistently - the metrics are never computed from a different slice of
  // data than what's shown in the table.
  private buildMatchStage(filters: Partial<GetFormReportDto>) {
    const match: Record<string, any> = {};

    if (filters.formId) match.formId = new Types.ObjectId(filters.formId);
    if (filters.userId) match.userId = new Types.ObjectId(filters.userId);
    if (filters.status) match.status = filters.status;
    if (filters.periodKey) match.periodKey = filters.periodKey;

    if (filters.dueDateFrom || filters.dueDateTo) {
      match.dueDate = {};
      if (filters.dueDateFrom)
        match.dueDate.$gte = new Date(filters.dueDateFrom);
      if (filters.dueDateTo) match.dueDate.$lte = new Date(filters.dueDateTo);
    }

    if (filters.overdue === 'true') {
      match.dueDate = { ...(match.dueDate ?? {}), $lt: new Date() };
      match.status = { $ne: FormOccurrenceStatus.COMPLETED };
    }

    return match;
  }

  private buildLookupStages(filters: Partial<GetFormReportDto>) {
    const stages: any[] = [
      {
        $lookup: {
          // FormBuilderForm's collection (the legacy form module owns `forms`).
          from: 'formbuilderforms',
          localField: 'formId',
          foreignField: '_id',
          as: 'form',
        },
      },
      { $unwind: '$form' },
      {
        $lookup: {
          from: 'formcategories',
          localField: 'form.categoryId',
          foreignField: '_id',
          as: 'form.category',
        },
      },
      {
        $unwind: { path: '$form.category', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            { $project: USER_PROJECTION },
          ],
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'formversions',
          localField: 'versionId',
          foreignField: '_id',
          as: 'version',
        },
      },
      { $unwind: { path: '$version', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'formresponses',
          localField: '_id',
          foreignField: 'occurrenceId',
          as: 'response',
        },
      },
      { $unwind: { path: '$response', preserveNullAndEmptyArrays: true } },
    ];

    if (filters.title) {
      stages.push({
        $match: { 'form.title': { $regex: filters.title, $options: 'i' } },
      });
    }
    if (filters.code) {
      stages.push({
        $match: { 'form.code': { $regex: filters.code, $options: 'i' } },
      });
    }
    if (filters.categoryId) {
      stages.push({
        $match: {
          'form.categoryId': new Types.ObjectId(filters.categoryId),
        },
      });
    }

    return stages;
  }

  async getReport(filters: GetFormReportDto) {
    const match = this.buildMatchStage(filters);
    const lookups = this.buildLookupStages(filters);

    const pipeline = [
      { $match: match },
      ...lookups,
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [
            { $skip: (filters.page ?? 0) * (filters.size ?? 10) },
            { $limit: filters.size ?? 10 },
          ],
          metadata: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.formOccurrenceRepositoryImpl.model.aggregate(
      pipeline,
    );
    return {
      data: result?.data ?? [],
      count: result?.metadata?.[0]?.count ?? 0,
    };
  }

  async getMetrics(filters: GetFormReportDto) {
    const match = this.buildMatchStage(filters);
    const lookups = this.buildLookupStages(filters);

    const pipeline = [
      { $match: match },
      ...lookups,
      {
        $group: {
          _id: null,
          expected: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $eq: ['$status', FormOccurrenceStatus.COMPLETED] },
                1,
                0,
              ],
            },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', FormOccurrenceStatus.COMPLETED] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          completedOnTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', FormOccurrenceStatus.COMPLETED] },
                    {
                      $or: [
                        { $eq: ['$dueDate', null] },
                        { $lte: ['$response.submittedAt', '$dueDate'] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const [result] = await this.formOccurrenceRepositoryImpl.model.aggregate(
      pipeline,
    );
    const expected = result?.expected ?? 0;
    const completed = result?.completed ?? 0;

    return {
      expected,
      completed,
      incomplete: expected - completed,
      overdue: result?.overdue ?? 0,
      onTimeCompletionPercentage:
        expected > 0
          ? Math.round(((result?.completedOnTime ?? 0) / expected) * 100)
          : 0,
    };
  }
}
