import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { FormDocument } from './schemas/form.schema';
import { FormsRepositoryImpl } from './repositories/form.repository';
import { SubmissionsRepositoryImpl } from './repositories/submission.repository';
import { SubmissionStatus } from './schemas/submission.schema';
import CustomError from 'src/common/providers/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';

@Injectable()
export class FormService extends CrudService<FormDocument> {
  constructor(
    private readonly formsRepositoryImpl: FormsRepositoryImpl,
    private readonly submissionsRepositoryImpl: SubmissionsRepositoryImpl,
  ) {
    super(formsRepositoryImpl);
  }

  async canDeleteForm(formId: string) {
    return this.submissionsRepositoryImpl.model.exists({ formId });
  }

  async submitForm(evaluatorId: string, formId: string, { data, userId }: any) {
    const form = await this.formsRepositoryImpl.findById(formId);
    if (!form || new Date(form.endDate) < new Date()) {
      throw new NotFoundException(
        'form not found or the submission time has expired',
      );
    }

    if (form.evaluator != evaluatorId) {
      throw new BadRequestException('you cant submit this form');
    }
    const targetUser = form.targetUsers.find(
      (tg) => tg.userId.toString() === userId,
    );

    if (!targetUser) {
      throw new BadRequestException('this user not assigned to evaluate');
    }

    if (targetUser.submissionId) {
      throw new BadRequestException(
        `you submitted this form for user #${userId} `,
      );
    }

    const questionsIds = form.questions.map((q) => q.questionId);

    data = questionsIds.reduce((acc, cur) => {
      if (data.hasOwnProperty(cur)) {
        return {
          ...acc,
          [cur]: data[cur],
        };
      } else {
        return acc;
      }
    }, {});

    if (
      data &&
      Object.keys(data).length === 0 &&
      Object.getPrototypeOf(data) === Object.prototype
    ) {
      throw new BadRequestException('submission data is empty');
    }

    if (Object.keys(data).length != questionsIds.length) {
      throw new BadRequestException('please answer all questions');
    }
    const values = Object.values(data);
    const avgScore =
      (values.reduce((a: number, b: number) => a + b, 0) as number) /
      values.length;
    let status = SubmissionStatus.END;
    if (avgScore > form.startEvalNumber && avgScore < form.endEvalNumber) {
      status = SubmissionStatus.TRAIN;
    } else if (avgScore > form.endEvalNumber) {
      status = SubmissionStatus.CONTINUE;
    }
    const submission = await this.submissionsRepositoryImpl.create({
      data,
      formId,
      userId,
      evaluatorId,
      avgScore: Math.round(avgScore * 100) / 100,
      status,
    });
    await this.formsRepositoryImpl.updateOne(
      { _id: form.id, 'targetUsers.userId': userId },
      {
        'targetUsers.$.submissionId': submission.id,
      },
    );

    return submission;
  }

  async submissionExist(formId: string) {
    const sub = await this.submissionsRepositoryImpl.findOne(
      { formId },
      {
        _id: 1,
      },
    );
    return !!sub;
  }

  async userSubmissions(query: any) {
    let condition: any = { $and: [] };
    let sort = null;
    let filters = null;
    try {
      if (query.filters) {
        filters = JSON.parse(query.filters);
        condition.$and.push(filters);
      }

      if (query.search) {
        const search = JSON.parse(query.search);
        // condition.$and = [];
        const orCond = { $or: [] };
        for (const key in search) {
          if (search.hasOwnProperty(key)) {
            const obj = {};
            obj[key] = { $regex: new RegExp(search[key], 'i') };
            orCond.$or.push(obj);
          }
        }
        condition.$and.push(orCond);
      }

      if (query.sort) {
        sort = JSON.parse(query.sort);
      }
    } catch (err) {
      throw new CustomError(
        HttpStatus.BAD_REQUEST,
        ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`,
      );
    }

    if (condition.$and.length == 0) {
      condition = {};
    }

    const count = await this.submissionsRepositoryImpl.count(condition);
    const data = await this.submissionsRepositoryImpl.find(
      condition,
      query?.projection,
      query.page,
      query.size,
      sort,
      query.populate,
    );
    return { data, count };
  }
}
