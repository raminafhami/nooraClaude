import apiClient from "@/api/client";

type UpdateProcessDto = Partial<{
	maxPossibleDuration: string | null;
}>;

async function updateProcess(processId: string, details: UpdateProcessDto) {
	const data: UpdateProcessDto = {
		maxPossibleDuration: details.maxPossibleDuration,
	};
	const response = await apiClient.put({
		url: `/process-definitions/${processId}`,
		body: data,
	});
	return response.result;
}
export { updateProcess };
