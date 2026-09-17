import apiClient from "@/api/client";

type SendEmailSeenStatusDto = {
	messageUid: string;
	folder: string;
	seen: string;
};

async function sendEmailSeenStatus({
	messageUid,
	folder,
	seen,
}: SendEmailSeenStatusDto): Promise<void> {
	await apiClient.put({
		url: `emails/folders/${folder}/messages/${messageUid}/seen`,
		searchParams: {
			seen,
		},
	});
}

export { sendEmailSeenStatus };
