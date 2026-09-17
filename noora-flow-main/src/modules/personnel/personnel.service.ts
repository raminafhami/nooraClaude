import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PersonnelRepositoryImpl } from './repository/personnel.repository.impl';
import { PersonnelDocument } from './schemas/personnel.schema';
import { CrudService } from 'src/shared/crud/service/crud.service';
import CustomError from 'src/common/providers/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PersonnelService extends CrudService<PersonnelDocument> {
  private readonly logger: Logger = new Logger(PersonnelService.name);

  constructor(private personnelRepositoryImpl: PersonnelRepositoryImpl) {
    super(personnelRepositoryImpl);
  }
}
