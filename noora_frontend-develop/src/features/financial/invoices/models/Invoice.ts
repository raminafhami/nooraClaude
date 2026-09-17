import { Income } from "@/financial/incomes/models/Income";
import { IncomeApi } from "@/financial/incomes/models/IncomeApi";
import { UserLookup, UserLookupApi } from "@/identity/users/models/UserLookup";

import { InvoiceStatus } from "../enums/InvoiceStatus";
import { InvoiceType } from "../enums/InvoiceType";
import { InvoiceRecipient } from "./InvoiceRecipient";

type Invoice = {
	id: string;
	invoiceNo: string;
	status: InvoiceStatus;
	type: InvoiceType;
	recipient: InvoiceRecipient;
	itemIds: string[];
	title: string;
	description: string;
	issueNo: string | null;
	issuedAt: Date | null;
	issuedById: string | null;
	expiryAt: Date | null;
	financialDocumentId: string | null;
	createdAt: Date;
	createdById: string;
	updatedAt: Date;
	updatedById: string;
	tax: number;
	total: number;
	lock?: number | null | undefined;

	items?: Income[];
	issuedBy?: UserLookup | null;
	createdBy?: UserLookup;
	updatedBy?: UserLookup;
};

type InvoiceApi = {
	_id: string;
	invoiceNo: string;
	type: InvoiceType;
	status: InvoiceStatus;
	recipient: InvoiceRecipient;
	items: string[] | IncomeApi[];
	title?: string;
	description?: string;
	issueNo?: string;
	issuedAt?: string;
	issuedBy?: string;
	expiryAt?: string;
	financialDocumentId?: string;
	createdAt: string;
	createdBy: UserLookupApi | string;
	updatedAt?: string;
	updatedBy: UserLookupApi | string;
	tax?: number;
	total?: number;
	lock?: number | null | undefined;
};

export type { Invoice, InvoiceApi };
