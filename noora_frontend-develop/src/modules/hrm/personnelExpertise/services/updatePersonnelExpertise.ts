import apiClient from "@/api/client";

import { PersonnelExpertise } from "../models/PersonnelExpertise";
import { PersonnelExpertiseApi } from "../models/PersonnelExpertiseApi";
import { PersonnelExpertiseStatus } from "../models/PersonnelExpertiseStatus";
import { parsePersonnelExpertise } from "../utils/parsePersonnelExpertise";

interface PersonnelExpertiseUpdateModel {
  status: PersonnelExpertiseStatus;
}

interface PersonnelExpertiseUpdateReturn extends PersonnelExpertise {}

interface PersonnelExpertiseUpdateApiModel {
  status?: PersonnelExpertiseStatus;
  data?: any;
}

interface PersonnelExpertiseUpdateApiReturn extends PersonnelExpertiseApi {}

export async function updatePersonnelExpertise(
  id: string,
  details: PersonnelExpertiseUpdateModel,
): Promise<PersonnelExpertiseUpdateReturn> {
  const data: PersonnelExpertiseUpdateApiModel = {};
  data.status = details.status;

  const response = await apiClient.put<PersonnelExpertiseUpdateApiReturn>({
    url: `/personnel-expertise/${id}`,
    body: data,
  });

  return parsePersonnelExpertise(response.result);
}
