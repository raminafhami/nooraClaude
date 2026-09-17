import { parsePaymentRule } from "@/financial/payment-rules/utils/parsePaymentRule";
import parseUser from "@/identity/users/utils/parseUser";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import { Cost } from "../models/Cost";
import { CostApi } from "../models/CostApi";

function parseCost(from: CostApi): Cost;

function parseCost(from: CostApi[]): Cost[];

function parseCost(from: CostApi | CostApi[]): Cost | Cost[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseCost(x));
	}

	let result: Cost = {
		id: from.id,
		caseId: from.caseId,
		caseNo: from.caseNo,
		caseStatus: from.caseStatus,
		categoryId:
			typeof from.categoryId === "string"
				? from.categoryId
				: from.categoryId.id,
		title: from.title,
		personId: from.personId
			? typeof from.personId === "string"
				? from.personId
				: from.personId.id
			: null,
		personName: from.personName ?? "",
		ruleId: from.ruleId
			? typeof from.ruleId === "string"
				? from.ruleId
				: from.ruleId.id
			: null,
		type: from.type ?? null,
		method: from.method ?? null,
		amount: from.amount ?? "",
		currency: from.currency ?? null,
		currencyRate: from.currencyRate ?? null,
		total: from.total ?? "",
		period: from.period ?? null,
		payment: from.payment,
		status: from.status,
		description: from.description ?? "",

		category: typeof from.categoryId === "object" ? from.categoryId : undefined,
		rule: from.ruleId
			? typeof from.ruleId === "object"
				? parsePaymentRule(from.ruleId)
				: undefined
			: null,
		person: from.personId
			? typeof from.personId === "object"
				? parseUser(from.personId)
				: undefined
			: null,
		instance: from.instance?.name
			? {
					name: from.instance.name!,
					createdAt: from.instance.createdAt!,
					status: from.instance.status!,
					inspectionFee: from.instance.inspectionFee!,
					buyer: from.instance.buyer!,
					invoicePaymentStatus:
						from.instance.invoicePaymentStatus ?? InvoicePaymentStatus.Unpaid,
				}
			: undefined,
	};

	return result;
}

export { parseCost };
