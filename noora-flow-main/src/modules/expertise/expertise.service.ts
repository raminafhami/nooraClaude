import { Injectable } from '@nestjs/common';
import { CreateExpertiseDto } from './dto/create-expertise.dto';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ExpertiseDocument } from './schemas/expertise.schema';
import { ExpertiseRepositoryImpl } from './repository/expertise.repository';

@Injectable()
export class ExpertiseService extends CrudService<ExpertiseDocument> {
  constructor(private expertiseRepositoryImpl: ExpertiseRepositoryImpl) {
    super(expertiseRepositoryImpl);
  }
}
