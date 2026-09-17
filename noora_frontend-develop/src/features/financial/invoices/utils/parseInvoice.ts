import { IncomeApi } from "@/financial/incomes/models/IncomeApi";
import { parseIncome } from "@/financial/incomes/utils/parseIncome";
import { parseUserLookup } from "@/identity/users/utils/parseUserLookup";

import { Invoice, InvoiceApi } from "../models/Invoice";
import { getInvoiceNoSequence } from "./getInvoiceNoSequence";

function parseInvoice(from: InvoiceApi): Invoice;

function parseInvoice(from: InvoiceApi[]): Invoice[];

function parseInvoice(from: InvoiceApi | InvoiceApi[]): Invoice | Invoice[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseInvoice(x));
	}

	return {
		id: from._id,
		invoiceNo: getInvoiceNoSequence(from.invoiceNo),
		type: from.type,
		status: from.status,
		recipient: from.recipient,
		itemIds: from.items.length
			? typeof from.items[0] === "string"
				? (from.items as string[])
				: (from.items as IncomeApi[]).map((x) => x.id)
			: [],
		title: from.title ?? "",
		description: from.description ?? "",
		issueNo: from.issueNo ?? null,
		issuedAt: from.issuedAt ? new Date(from.issuedAt) : null,
		issuedById: from.issuedBy ?? null,
		expiryAt: from.expiryAt ? new Date(from.expiryAt) : null,
		financialDocumentId: from.financialDocumentId ?? null,
		createdAt: new Date(from.createdAt),
		createdById:
			typeof from.createdBy === "string" ? from.createdBy : from.createdBy.id,
		updatedAt: from.updatedAt
			? new Date(from.updatedAt)
			: new Date(from.createdAt),
		updatedById: from.updatedBy
			? typeof from.updatedBy === "string"
				? from.updatedBy
				: from.updatedBy.id
			: typeof from.createdBy === "string"
				? from.createdBy
				: from.createdBy.id,
		tax: from.tax ?? 0,
		total: from.total ?? 0,
		lock: from.lock,

		items: from.items.length
			? typeof from.items[0] === "object"
				? parseIncome(from.items as IncomeApi[])
				: undefined
			: [],
		createdBy:
			typeof from.createdBy === "object"
				? parseUserLookup(from.createdBy)
				: undefined,
		updatedBy: from.updatedBy
			? typeof from.updatedBy === "object"
				? parseUserLookup(from.updatedBy)
				: undefined
			: typeof from.createdBy === "object"
				? parseUserLookup(from.createdBy)
				: undefined,
		issuedBy:
			typeof from.issuedBy === "object"
				? parseUserLookup(from.issuedBy)
				: undefined,
	};
}

export { parseInvoice };
