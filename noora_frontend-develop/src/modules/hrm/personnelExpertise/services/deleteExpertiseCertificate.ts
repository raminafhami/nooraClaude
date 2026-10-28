import apiClient from "@/api/client";

import { PersonnelExpertise } from "../models/PersonnelExpertise";
import { PersonnelExpertiseApi } from "../models/PersonnelExpertiseApi";
import { parsePersonnelExpertise } from "../utils/parsePersonnelExpertise";

// Removes an uploaded certificate (record + file). Returns the checklist row:
// back to "ندارد", or still "دارد" with its next certificate if it had more
// than one (merged duplicate items).
async function deleteExpertiseCertificate(
	personnelExpertiseId: string,
): Promise<PersonnelExpertise> {
	const response = await apiClient.delete<PersonnelExpertiseApi>({
		url: `personnel-expertise/${personnelExpertiseId}/certificate`,
	});

	return parsePersonnelExpertise(response.result);
}

export { deleteExpertiseCertificate };
