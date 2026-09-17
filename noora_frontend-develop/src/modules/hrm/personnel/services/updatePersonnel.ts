import apiClient from "@/api/client";
import { TimeString } from "@/time/TimeString";

import { PersonnelApi } from "../models/Personnel";
import { PersonnelAcademicDegree } from "../models/PersonnelAcademicDegree";
import { PersonnelExpertise } from "../models/PersonnelExpertise";
import { PersonnelJob } from "../models/PersonnelJob";

interface PersonnelDetails {
  id?: string;
  userId?: string;
  fatherName?: string;
  birthCertificateNo?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  landlineNo?: string | null;
  branchId?: string | null;
  academics?: PersonnelAcademicDegree[];
  jobs?: PersonnelJob[] | string[];
  expertises?: PersonnelExpertise[];
  maxExtraTime?: TimeString;
  maxDayLeave?: number;
  maxManualTime?: number;
  internalPhoneNo?: string | null;
  sepidarId?: string | null;
}

export async function updatePersonnel(
  userId: string,
  details: PersonnelDetails,
) {
  const response = await apiClient.put<PersonnelApi>({
    url: `/personnel/${userId}`,
    body: details,
  });

  return response;
}
