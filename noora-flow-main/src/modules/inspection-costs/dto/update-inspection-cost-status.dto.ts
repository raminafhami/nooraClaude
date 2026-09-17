import { IsEnum, IsNotEmpty } from 'class-validator';
import { InspectionCostCaseStatus } from '../schemas/inspection-cost.schema';

export class UpdateInspectionCostCaseStatusDto {
  @IsNotEmpty()
  @IsEnum(InspectionCostCaseStatus)
  caseStatus: InspectionCostCaseStatus;
}
