import { parseCost } from "@/financial/costs/utils/parseCost";
import { parseUserLookup } from "@/identity/users/utils/parseUserLookup";

import { Income } from "../models/Income";
import { IncomeApi } from "../models/IncomeApi";

function parseIncome(from: IncomeApi): Income;

function parseIncome(from: IncomeApi[]): Income[];

function parseIncome(from: IncomeApi | IncomeApi[]): Income | Income[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseIncome(x));
	}

	let result: Income = {
		id: from.id,
		instanceId: from.instanceId,
		caseNo: from.caseNo,
		costId: from.costId
			? typeof from.costId === "string"
				? from.costId
				: from.costId.id
			: null,
		categoryId:
			typeof from.categoryId === "string"
				? from.categoryId
				: from.categoryId.id,
		title: from.title,
		description: from.description,
		amount: from.amount,
		currency: from.currency,
		currencyRate: from.currencyRate,
		quantity: from.quantity,
		unit: from.unit,
		discount: from.discount,
		additionalFee: from.additionalFee,
		tax: from.tax,
		total: from.total,
		status: from.status,
		type: from.type,
		isDeleted: from.isDeleted,
		createdAt: from.createdAt,
		createdById:
			typeof from.createdBy === "string" ? from.createdBy : from.createdBy.id,
		updatedAt: from.updatedAt ?? from.createdAt,
		updatedById:
			typeof from.updatedBy === "string" ? from.updatedBy : from.updatedBy.id,
		lock: from.lock,

		cost: from.costId
			? typeof from.costId === "object"
				? parseCost(from.costId)
				: undefined
			: null,
		category: typeof from.categoryId === "object" ? from.categoryId : undefined,
		createdBy:
			typeof from.createdBy === "object"
				? parseUserLookup(from.createdBy)
				: undefined,
		updatedBy:
			typeof from.updatedBy === "object"
				? parseUserLookup(from.updatedBy)
				: undefined,
	};

	return result;
}

export { parseIncome };
