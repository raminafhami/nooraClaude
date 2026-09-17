import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

import { Course, CourseDocument } from '../schemas/course.schema';

@Injectable()
export class CourseRepositoryImpl extends BaseRepositoryImpl<CourseDocument> {
  constructor(
    @InjectModel(Course.name)
    protected courseModel: Model<CourseDocument>,
  ) {
    super(courseModel);
  }
}
