import apiClient from "@/api/client";

type UpdateUnofficialPettyCostDto = Partial<{
	currencyRate: number;
	spentDate: string;
	categoryId: string;
}>;

type UpdateUnofficialPettyCostApi = UpdateUnofficialPettyCostDto;

async function updateUnofficialPettyCost(
	id: string,
	details: UpdateUnofficialPettyCostDto,
): Promise<void> {
	const data: UpdateUnofficialPettyCostApi = {
		currencyRate: details.currencyRate,
		spentDate: details.spentDate,
		categoryId: details.categoryId,
	};

	await apiClient.put({
		url: `petty-cost/unofficial/${id}`,
		body: data,
	});
}

export { updateUnofficialPettyCost };
