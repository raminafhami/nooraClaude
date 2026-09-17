import apiClient from "@/api/client";

type UpdateProcessStageDto = Partial<{
	dueDate: string | null;
}>;

async function updateProcessStage(
	processId: string,
	stageId: string,
	details: UpdateProcessStageDto,
) {
	const data: UpdateProcessStageDto = {
		dueDate: details.dueDate,
	};

	const response = await apiClient.put({
		url: `/process-definitions/${processId}/stages/${stageId}`,
		body: data,
	});
	return response.result;
}

export { updateProcessStage };
