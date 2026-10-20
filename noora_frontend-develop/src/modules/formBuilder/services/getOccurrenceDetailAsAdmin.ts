import apiClient from "@/api/client";

import { FormOccurrence } from "../models/FormOccurrence";
import { FormResponse } from "../models/FormResponse";
import { FormVersion } from "../models/FormVersion";

type OccurrenceAdminDetail = {
	occurrence: FormOccurrence;
	response: FormResponse | null;
	version: FormVersion | null;
	form: {
		id: string;
		title: string;
		code: string;
		category?: { title: string } | null;
	} | null;
	user: { id: string; name: string; lastname: string } | null;
};

async function getOccurrenceDetailAsAdmin(
	occurrenceId: string,
): Promise<OccurrenceAdminDetail> {
	const response = await apiClient.get<OccurrenceAdminDetail>({
		url: `form-builder/reports/occurrences/${occurrenceId}/detail`,
	});

	return response.result;
}

export { getOccurrenceDetailAsAdmin };
export type { OccurrenceAdminDetail };
