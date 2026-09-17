import apiClient from "@/api/client";
import { ApiPageResult } from "@/api/models/ApiResponse";

import { EmailType } from "../models/Email";

type GetEmailDto = {
	folder: string;
	size: number;
	page: number;
	subject?: string;
	after?: string;
	before?: string;
	unread?: string;
	from?: string;
};

async function getEmails({
	folder,
	page,
	size,
	subject,
	after,
	before,
	unread,
	from,
}: GetEmailDto): Promise<ApiPageResult<EmailType>> {
	const response = await apiClient.get<ApiPageResult<EmailType>>({
		url: `emails/folders/${folder}`,
		searchParams: {
			page,
			size,
			...(subject?.trim() && { subject }),
			...(after && after !== "Invalid date" && { after }),
			...(before && before !== "Invalid date" && { before }),
			...(unread && { unread }),
			...(from && { from }),
		},
	});

	return response.result;
}

export { getEmails };
