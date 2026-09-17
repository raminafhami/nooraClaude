import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app/config.module';
import { RasmioService } from './rasmio.service';
import { RasmioController } from './rasmio.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AppConfigModule, HttpModule],
  providers: [RasmioService],
  controllers: [RasmioController],
})
export class RasmioModule {}
