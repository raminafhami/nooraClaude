import apiClient from "@/api/client";
import downloadBlob from "@/utils/downloadBlob";

type DownloadInstanceTemplateDto = {
	instanceId: string;
	templateName: string;
	variables: string[];
	output: string;
};

async function downloadInstanceTemplate({
	instanceId,
	templateName,
	variables,
	output,
}: DownloadInstanceTemplateDto): Promise<void> {
	const url = `/files/${instanceId}/export/vars/${variables.join(
		",",
	)}?template=${templateName}&download=1`;

	const blob = await apiClient.send({
		url: url,
		responseType: "blob",
	});

	downloadBlob({
		blob,
		filename: `${output}.pdf`,
	});
}

export { downloadInstanceTemplate };
