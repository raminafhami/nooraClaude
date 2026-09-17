import apiClient from "@/api/client";
import { Currency } from "@/enums/Currency";

import { IncomeType } from "../enums/IncomeType";
import { IncomeUnit } from "../enums/IncomeUnit";
import { Income } from "../models/Income";
import { IncomeApi } from "../models/IncomeApi";
import { parseIncome } from "../utils/parseIncome";

interface CreateIncomeDto {
	instanceId?: string;
	costId?: string | null;
	categoryId: string;
	title: string;
	description: string;
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity?: number;
	unit?: IncomeUnit;
	discount?: number;
	hasTax?: boolean;
}

interface CreateIncomeApi {
	instanceId?: string;
	costId: string | null;
	categoryId: string;
	title: string;
	description: string;
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity: number;
	unit: IncomeUnit;
	discount: number;
	additionalFee: number;
	type: IncomeType;
	hasTax?: boolean;
}

async function createIncome(details: CreateIncomeDto): Promise<Income> {
	const data: CreateIncomeApi = {
		instanceId: details.instanceId,
		costId: details.costId ?? null,
		categoryId: details.categoryId,
		title: details.title,
		description: details.description.trim(),
		amount: details.amount,
		currency: details.currency,
		currencyRate: details.currencyRate,
		quantity: details.quantity ?? 1,
		unit: details.unit ?? IncomeUnit.Pieces,
		discount: details.discount ?? 0,
		additionalFee: 0,
		type: details.instanceId ? IncomeType.Instance : IncomeType.Education,
		hasTax: details.hasTax,
	};

	const response = await apiClient.post<IncomeApi>({
		url: "income",
		body: data,
	});

	return parseIncome(response.result);
}

export { createIncome };
