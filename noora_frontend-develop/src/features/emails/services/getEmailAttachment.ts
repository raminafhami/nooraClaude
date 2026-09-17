import apiClient from "@/api/client";

type GetEmailAttachmentDto = {
	emailUid: number;
	attachmentIndex: number;
};

async function getEmailAttachment({
	emailUid,
	attachmentIndex,
}: GetEmailAttachmentDto): Promise<Blob> {
	const response = await apiClient.send({
		url: `emails/attachments/${emailUid}/${attachmentIndex}`,
		responseType: "blob",
	});
	return response;
}
export { getEmailAttachment };
