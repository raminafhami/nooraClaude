import { Injectable } from '@nestjs/common';
import { CreateExpertiseDto } from './dto/create-expertise.dto';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ExpertiseDocument } from './schemas/expertise.schema';
import { ExpertiseRepositoryImpl } from './repository/expertise.repository';

// Two items are the same when type and title match, Arabic/Persian letters,
// ZWNJ and spaces aside (the rule the training page uses).
export const normalizeExpertiseTitle = (title?: string) =>
  (title ?? '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/‌/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

@Injectable()
export class ExpertiseService extends CrudService<ExpertiseDocument> {
  constructor(private expertiseRepositoryImpl: ExpertiseRepositoryImpl) {
    super(expertiseRepositoryImpl);
  }

  // An existing item of this type with the same title (other than `exceptId`).
  async findSameItem(type: string, title: string, exceptId?: string) {
    const wanted = normalizeExpertiseTitle(title);
    const sameType = await this.expertiseRepositoryImpl.model
      .find({ type, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })
      .select('_id type title')
      .lean();
    return sameType.find((e) => normalizeExpertiseTitle(e.title) === wanted);
  }
}
