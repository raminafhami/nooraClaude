import apiClient from "@/api/client";

import { Personnel, PersonnelApi } from "../models/Personnel";
import { PersonnelQueryPopulate } from "../models/PersonnelQuery";
import { parsePersonnel } from "../utils/parsePersonnel";

export async function getPersonnelById(
  userId: string,
  populate: PersonnelQueryPopulate[],
): Promise<Personnel> {
  const response = await apiClient.get<PersonnelApi>({
    url: `/personnel/${userId}?populate=${populate?.join(",") || ""}`,
  });

  return parsePersonnel(response.result);
}
