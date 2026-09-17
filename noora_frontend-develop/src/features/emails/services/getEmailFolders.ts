import apiClient from "@/api/client";

import { EmailFoldersType } from "../models/EmailContext";

interface GetEmailFoldersResponse {
	folders: EmailFoldersType[];
	total: number;
}

// TODO: correct response type with data and count
async function getEmailFolders(): Promise<GetEmailFoldersResponse> {
	const response = await apiClient.get<GetEmailFoldersResponse>({
		url: "emails/folders",
	});

	return response.result;
}

export { getEmailFolders };
