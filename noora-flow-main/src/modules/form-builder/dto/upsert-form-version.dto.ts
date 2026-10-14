import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { FormQuestionDto } from './form-question.dto';

// Replaces the full question list of the current draft version in one call.
// Simpler and safer than per-question CRUD endpoints: the builder UI always
// holds the complete draft in memory, and a full-list PUT means there is no
// way for "add"/"reorder"/"delete" to drift out of sync between requests.
export class UpsertFormVersionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormQuestionDto)
  questions: FormQuestionDto[];
}
