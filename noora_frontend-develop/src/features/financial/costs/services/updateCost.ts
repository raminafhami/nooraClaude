import apiClient from "@/api/client";
import { Currency } from "@/enums/Currency";

import { CostMethod } from "../enums/CostMethod";
import { CostPeriod } from "../enums/CostPeriod";
import { CostType } from "../enums/CostType";
import { Cost } from "../models/Cost";
import { CostApi } from "../models/CostApi";
import { parseCost } from "../utils/parseCost";

interface CostUpdateModel {
	title: string;
	personId?: string | null;
	personName?: string | null;
	ruleId?: string | null;
	type: CostType;
	method: CostMethod;
	amount: string;
	currency: Currency;
	currencyRate: number;
	total: string;
	period: CostPeriod;
	description?: string;
}

interface CostUpdateApiModel {
	title: string;
	personId: string | null;
	personName: string | null;
	ruleId: string | null;
	type: CostType;
	method: CostMethod;
	amount: string;
	currency: Currency;
	currencyRate: number;
	total: string;
	period: CostPeriod;
	description: string | null;
}

async function updateCost(
	id: string,
	details: Partial<CostUpdateModel>,
): Promise<Cost> {
	const data: Partial<CostUpdateApiModel> = {};

	const keys = Object.keys(details) as (keyof CostUpdateModel)[];

	keys.includes("title") && (data.title = details.title);
	keys.includes("personId") && (data.personId = details.personId ?? null);
	keys.includes("personName") && (data.personName = details.personName ?? null);
	keys.includes("ruleId") && (data.ruleId = details.ruleId ?? null);
	keys.includes("type") && (data.type = details.type);
	keys.includes("method") && (data.method = details.method);
	keys.includes("amount") && (data.amount = details.amount);
	keys.includes("currency") && (data.currency = details.currency);
	keys.includes("currencyRate") && (data.currencyRate = details.currencyRate);
	keys.includes("total") && (data.total = details.total);
	keys.includes("period") && (data.period = details.period);
	keys.includes("description") &&
		(data.description = details.description || null);

	const response = await apiClient.put<CostApi>({
		url: `/inspection-costs/${id}`,
		body: data,
	});

	return parseCost(response.result);
}

export { updateCost };
