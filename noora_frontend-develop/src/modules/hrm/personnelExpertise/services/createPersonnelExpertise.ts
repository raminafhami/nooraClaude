import apiClient from "@/api/client";

import { PersonnelExpertiseApi } from "../models/PersonnelExpertiseApi";
import { PersonnelExpertiseStatus } from "../models/PersonnelExpertiseStatus";

export interface PersonnelExpertiseCreateModel {
  expertiseId: string;
  userId: string;
  status: PersonnelExpertiseStatus;
}

type PersonnelCreateReturn = boolean;

export async function createPersonnelExpertise(
  details: PersonnelExpertiseCreateModel[],
): Promise<PersonnelCreateReturn> {
  const response = await apiClient.post<PersonnelExpertiseApi>({
    url: `/personnel-expertise/bulk`,
    body: { items: details },
  });

  return response.success;
}
