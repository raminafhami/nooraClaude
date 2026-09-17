import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { UserFileDocument } from './schemas/user-file.schema';
import { UserFileRepositoryImpl } from './repository/user-files.repository';
import * as fs from 'fs/promises';
@Injectable()
export class UserFilesService extends CrudService<UserFileDocument> {
  constructor(private userFileRepositoryImpl: UserFileRepositoryImpl) {
    super(userFileRepositoryImpl);
  }

  async getUserSignature(userId: string) {
    const file = await this.userFileRepositoryImpl.findOne({
      userId,
      key: 'signature',
      status: 'confirm',
    });
    if (!file) return null;
    return fs.readFile(file.path, { encoding: 'base64' });
  }
}
