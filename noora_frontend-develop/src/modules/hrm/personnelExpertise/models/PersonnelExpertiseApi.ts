import { PersonnelCertificate } from "./PersonnelCertificate";
import { PersonnelExpertiseStatus } from "./PersonnelExpertiseStatus";

export interface PersonnelExpertiseApi {
  id: string;
  userId: string;
  expertiseId: string;
  status: PersonnelExpertiseStatus;
  modifyBy: string | null;
  modifyAt: string | null;
  data?: {
    certificateId?: string | null;
    certificate?: PersonnelCertificate | null;
  };
}

export interface PersonnelExpertiseDb
  extends Omit<PersonnelExpertiseApi, "id"> {
  _id: string;
}
