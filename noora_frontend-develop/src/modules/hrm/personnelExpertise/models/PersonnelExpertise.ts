import { PersonnelCertificate } from "./PersonnelCertificate";
import { PersonnelExpertiseStatus } from "./PersonnelExpertiseStatus";

export interface PersonnelExpertise {
  id: string;
  userId: string;
  expertiseId: string;
  status: PersonnelExpertiseStatus;
  modifyBy: string | null;
  modifyAt: string | null;

  certificateId?: string | null;
  certificate?: PersonnelCertificate | null;
}
