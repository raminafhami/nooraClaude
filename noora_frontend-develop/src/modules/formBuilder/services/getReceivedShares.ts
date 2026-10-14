import apiClient from "@/api/client";

import { FormShare } from "../models/FormShare";

async function getReceivedShares(): Promise<FormShare[]> {
	const response = await apiClient.get<FormShare[]>({
		url: "form-builder/me/received-forms",
	});

	return response.result;
}

export { getReceivedShares };
