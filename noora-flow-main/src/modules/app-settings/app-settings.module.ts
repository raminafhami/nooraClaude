import { Global, Module } from '@nestjs/common';
import { AppSettingsService } from './app-settings.service';
import { AppSettingsController } from './app-settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schemas/settings.schema';
import { SettingsRepository } from './repository/settings.repository';
import { AppConfigModule } from 'src/config/app/config.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Setting.name,
        schema: SettingSchema,
      },
    ]),
    AppConfigModule,
  ],
  providers: [AppSettingsService, SettingsRepository],
  controllers: [AppSettingsController],
  exports: [AppSettingsService],
})
export class AppSettingsModule {}
