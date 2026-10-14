import apiClient from "@/api/client";

import { FormCategory } from "../models/FormCategory";
import { FormOccurrence } from "../models/FormOccurrence";
import { FormVersion } from "../models/FormVersion";

type OccurrenceVersion = {
	occurrence: FormOccurrence;
	version: FormVersion;
	form: {
		id: string;
		title: string;
		code: string;
		category?: FormCategory;
	} | null;
};

async function getOccurrenceVersion(
	occurrenceId: string,
): Promise<OccurrenceVersion> {
	const response = await apiClient.get<OccurrenceVersion>({
		url: `form-builder/occurrences/${occurrenceId}/version`,
	});

	return response.result;
}

export { getOccurrenceVersion };
export type { OccurrenceVersion };
