import apiClient from "@/api/client";
import { Currency } from "@/enums/Currency";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { GenericObject } from "@/ts/GenericObject";

import { CostCaseStatus } from "../enums/CostCaseStatus";
import { CostMethod } from "../enums/CostMethod";
import { CostPeriod } from "../enums/CostPeriod";
import { CostType } from "../enums/CostType";
import { Cost } from "../models/Cost";
import { CostApi } from "../models/CostApi";
import { parseCost } from "../utils/parseCost";

interface CreateCostModel {
	caseId: string;
	caseNo?: string;
	categoryId?: string;
	categoryKey?: string;
	title?: string;
	personId?: string | null;
	personName?: string | null;
	ruleId?: string | null;
	type?: CostType;
	method?: CostMethod;
	amount?: string;
	currency?: Currency;
	currencyRate?: number;
	total?: string;
	period?: CostPeriod;
	description?: string;
	options?: GenericObject;
}

interface CreateCostApi {
	caseId: string;
	caseNo: string;
	caseStatus: CostCaseStatus;
	categoryId: string;
	title: string;
	personId: string | null;
	personName: string | null;
	ruleId: string | null;
	type: CostType | undefined;
	method: CostMethod | undefined;
	amount: string | undefined;
	currency?: Currency;
	currencyRate?: number;
	total: string;
	period: CostPeriod | undefined;
	description: string;
}

async function createCost(details: CreateCostModel): Promise<Cost> {
	let categoryId: string | undefined = details.categoryId;
	let title: string | undefined = details.title;

	if ((!categoryId || !title) && details.categoryKey) {
		const category = await getFinancialCategories({
			filters: { key: details.categoryKey },
		}).then((categories) => categories.at(0));

		if (!categoryId) {
			categoryId = category?.id;
		}

		if (!title) {
			title = category?.title;
		}
	}

	if (!categoryId) {
		throw new Error("categoryId is not found.");
	}

	if (!title) {
		throw new Error("title is not found.");
	}

	const data: CreateCostApi = {
		caseId: details.caseId,
		caseNo: details.caseNo ?? "0",
		caseStatus: CostCaseStatus.Unpaid,
		categoryId,
		title,
		personId: details.personId ?? null,
		personName: details.personName?.trim() || null,
		ruleId: details.ruleId ?? null,
		type: details.type,
		method: details.method,
		amount: details.amount,
		currency: details.currency,
		currencyRate: details.currencyRate,
		total: details.total ?? "0",
		period: details.period,
		description: details.description ?? "",
	};

	const response = await apiClient.post<CostApi>({
		url: "/inspection-costs",
		body: data,
	});

	return parseCost(response.result);
}

export { createCost };
export type { CreateCostModel };
