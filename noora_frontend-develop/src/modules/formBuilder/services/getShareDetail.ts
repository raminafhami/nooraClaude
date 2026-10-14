import apiClient from "@/api/client";

import { Form } from "../models/Form";
import { FormResponse } from "../models/FormResponse";
import { FormShare } from "../models/FormShare";
import { FormVersion } from "../models/FormVersion";

type ShareDetail = {
	share: FormShare;
	response: FormResponse;
	version: FormVersion;
	form: Form;
};

async function getShareDetail(shareId: string): Promise<ShareDetail> {
	const response = await apiClient.get<ShareDetail>({
		url: `form-builder/shares/${shareId}`,
	});

	return response.result;
}

export { getShareDetail };
export type { ShareDetail };
