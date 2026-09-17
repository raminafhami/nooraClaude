import { PartialType } from '@nestjs/swagger';
import { CreateDispatcherCategoryDto } from './create-dispatcher-category.dto';

export class UpdateDispatcherCategoryDto extends PartialType(CreateDispatcherCategoryDto) {}
