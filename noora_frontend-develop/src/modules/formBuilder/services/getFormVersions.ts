import apiClient from "@/api/client";

import { FormVersionStatus } from "../enums/FormVersionStatus";

type FormVersionListItem = {
	id: string;
	versionNo: number;
	status: FormVersionStatus;
	publishedAt?: string | null;
	createdAt: string;
};

async function getFormVersions(formId: string): Promise<FormVersionListItem[]> {
	const response = await apiClient.get<FormVersionListItem[]>({
		url: `form-builder/forms/${formId}/versions`,
	});

	return response.result;
}

export { getFormVersions };
export type { FormVersionListItem };
