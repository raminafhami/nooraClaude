import { ExpertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";

export interface PersonnelExpertise {
  id: string;
  expertiseId: string;
  type: ExpertiseType;
  title: string;
  status: PersonnelExpertiseStatus | null;
  certificateId?: string;
  certificate?: {
    id: string;
    organizationName: string;
    certificateDate: string;
  };
}

export interface PersonnelExpertiseApi {
  id: string;
  expertiseId: string;
  type: ExpertiseType;
  title: string;
  status: PersonnelExpertiseStatus | null;
  data?: {
    certificateId?: string;
    certificate?: {
      id: string;
      organizationName: string;
      certificateDate: string;
    };
  };
}
