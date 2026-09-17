import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './repository/settings.repository';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { SettingDocument } from './schemas/settings.schema';

@Injectable()
export class AppSettingsService extends CrudService<SettingDocument> {
  constructor(private readonly settingsRepositoryIml: SettingsRepository) {
    super(settingsRepositoryIml);
  }
}
