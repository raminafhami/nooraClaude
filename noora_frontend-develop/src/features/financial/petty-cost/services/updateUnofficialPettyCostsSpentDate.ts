import apiClient from "@/api/client";

type UpdateUnofficialPettyCostsSpentDateDto = Partial<{
	costIds: string[];
	spentDate: string;
}>;

type UpdateUnofficialPettyCostsSpentDateApi =
	UpdateUnofficialPettyCostsSpentDateDto;

async function updateUnofficialPettyCostsSpentDate(
	details: UpdateUnofficialPettyCostsSpentDateDto,
): Promise<void> {
	const data: UpdateUnofficialPettyCostsSpentDateApi = {
		costIds: details.costIds,
		spentDate: details.spentDate,
	};

	const response = await apiClient.put({
		url: "petty-cost/update/unofficial/spent-date",
		body: data,
	});

	console.info({ response });
}

export { updateUnofficialPettyCostsSpentDate };
