import apiClient from "@/api/client";

import { ExpertiseCertificateApi } from "../models/ExpertiseCertificateApi";
import { PersonnelExpertise } from "../models/PersonnelExpertise";
import { PersonnelExpertiseApi } from "../models/PersonnelExpertiseApi";
import { parsePersonnelExpertise } from "../utils/parsePersonnelExpertise";

interface PersonnelCertificateCreateReturn extends PersonnelExpertise {}

export async function createExpertiseCertificate(
  details: ExpertiseCertificateApi,
): Promise<PersonnelCertificateCreateReturn> {
  const data = new FormData();
  Object.keys(details).forEach((key) => {
    const value = details[key];
    data.append(key, value);
  });
  data.append("data", "{}");

  const response = await apiClient.post<PersonnelExpertiseApi>({
    url: `/personnel-expertise/certificate?userId=${details.userId}`,
    body: data,
    contentType: "multipart",
  });

  return parsePersonnelExpertise(response.result);
}
