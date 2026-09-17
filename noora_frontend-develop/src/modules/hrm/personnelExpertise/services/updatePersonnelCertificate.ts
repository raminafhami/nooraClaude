import apiClient from "@/api/client";

import { PersonnelExpertise } from "../models/PersonnelExpertise";
import { PersonnelExpertiseApi } from "../models/PersonnelExpertiseApi";
import { parsePersonnelExpertise } from "../utils/parsePersonnelExpertise";

interface PersonnelCertificateUpdateModel {
  organizationName: string;
  certificateDate: string;
  certificateFile: File;
}

interface PersonnelCertificateUpdateReturn extends PersonnelExpertise {}

type PersonnelCertificateUpdateApiModel = FormData;

interface PersonnelCertificateUpdateApiReturn extends PersonnelExpertiseApi {}

export async function updatePersonnelCertificate(
  id: string,
  details: PersonnelCertificateUpdateModel,
): Promise<PersonnelCertificateUpdateReturn> {
  const data: PersonnelCertificateUpdateApiModel = new FormData();
  data.append("organizationName", details.organizationName);
  data.append("certificateDate", details.certificateDate);
  data.append("file", details.certificateFile);

  const response = await apiClient.post<PersonnelCertificateUpdateApiReturn>({
    url: `/personnel-expertise/${id}/certificate`,
    body: data,
    contentType: "multipart",
  });

  return parsePersonnelExpertise(response.result);
}
