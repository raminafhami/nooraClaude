import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CourseDocument } from './schemas/course.schema';
import { CourseRepositoryImpl } from './repository/course.repository';

@Injectable()
export class CourseService extends CrudService<CourseDocument> {
  constructor(private courseRepositoryImpl: CourseRepositoryImpl) {
    super(courseRepositoryImpl);
  }

  async findByIdAndUpdateParticipants(id: string, data: any) {
    let updateQuery = {};
    if (data.mode === '+') {
      updateQuery = { $addToSet: { users: data.users } };
    } else {
      updateQuery = { $pull: { users: { $in: data.users } } };
    }

    return this.courseRepositoryImpl.findByIdAndUpdate(id, updateQuery);
  }
}
