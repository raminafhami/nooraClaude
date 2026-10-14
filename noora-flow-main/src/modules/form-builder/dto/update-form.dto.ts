import { PartialType } from '@nestjs/swagger';
import { CreateFormDto } from './create-form.dto';

// Only metadata (title/category/description) - code, status and version
// pointers are never editable through this DTO; they change only through
// the dedicated publish/new-version/archive endpoints in FormService.
export class UpdateFormDto extends PartialType(CreateFormDto) {}
