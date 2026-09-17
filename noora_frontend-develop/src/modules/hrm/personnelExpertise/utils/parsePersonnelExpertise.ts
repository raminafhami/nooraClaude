import { PersonnelExpertise } from "../models/PersonnelExpertise";
import { PersonnelExpertiseApi } from "../models/PersonnelExpertiseApi";

export function parsePersonnelExpertise(
  from: PersonnelExpertiseApi
): PersonnelExpertise;
export function parsePersonnelExpertise(
  from: PersonnelExpertiseApi[]
): PersonnelExpertise[];
export function parsePersonnelExpertise(
  from: PersonnelExpertiseApi | PersonnelExpertiseApi[]
): PersonnelExpertise | PersonnelExpertise[] {
  if (Array.isArray(from)) {
    return from.map((x) => parsePersonnelExpertise(x));
  }

  const result: PersonnelExpertise = {
    id: from.id,
    expertiseId: from.expertiseId,
    userId: from.userId,
    status: from.status,
    modifyAt: from.modifyAt,
    modifyBy: from.modifyBy,
    certificateId: from.data?.certificateId,
    certificate: from.data?.certificate,
  };

  return result;
}
