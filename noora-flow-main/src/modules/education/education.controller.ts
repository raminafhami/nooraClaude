import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EducationService } from './education.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('education')
@ApiBearerAuth('token')
@Controller('education')
export class EducationController {
  constructor(private readonly educationService: EducationService) {}
}
