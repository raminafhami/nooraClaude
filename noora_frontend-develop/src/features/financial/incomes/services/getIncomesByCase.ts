import apiClient from "@/api/client";

import { Income } from "../models/Income";
import { IncomeApi } from "../models/IncomeApi";
import { parseIncome } from "../utils/parseIncome";

type GetIncomesByCaseResult = {
	items: IncomeApi[];
	tax: number;
	duty: number;
	total: number;
};

type GetIncomesByCaseReturn = {
	items: Income[];
	tax: number;
	duty: number;
	total: number;
};

async function getIncomesByCase(
	instanceId: string,
): Promise<GetIncomesByCaseReturn> {
	const response = await apiClient.get<GetIncomesByCaseResult>({
		url: `income/case/${instanceId}`,
	});

	return {
		items: parseIncome(response.result.items),
		tax: response.result.tax,
		duty: response.result.duty,
		total: response.result.total,
	};
}

export { getIncomesByCase };
