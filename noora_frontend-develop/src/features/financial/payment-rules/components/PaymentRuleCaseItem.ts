import { CaseType } from "@/inspection/models/CaseType";
import { InspectionMethod } from "@/inspection/models/InspectionMethod";
import { InspectionRole } from "@/inspection/models/InspectionRoles";
import { InspectionType } from "@/inspection/models/InspectionType";

type PaymentRuleCaseItem = Partial<{
  inspectionType: InspectionType | null;
  caseType: CaseType | null;
  inspectionMethod: InspectionMethod | null;
  role: InspectionRole | null;
}>;

type PaymentRuleCaseItemKey =
  | "buyer"
  | "inspectionType"
  | "caseType"
  | "inspectionMethod"
  | "role";

export type { PaymentRuleCaseItem, PaymentRuleCaseItemKey };
