import apiClient from "@/api/client";

type UpdatePettyCostStatusApi = Partial<{
	status: string;
	costIds: string[];
}>;

async function updatePettyCostStatus(
	status: string,
	costIds: string[],
): Promise<any> {
	const data: UpdatePettyCostStatusApi = {
		costIds: costIds,
		status: status,
	};

	const response = await apiClient.put({
		url: `petty-cost/status`,
		body: data,
	});

	return response.result;
}

export { updatePettyCostStatus };
