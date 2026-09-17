import { Instance } from "@/felo/instances/models/Instance";
import { UserLookup } from "@/identity/users/models/UserLookup";

import { PaymentType } from "../../flows/invoice-payment/enums/PaymentType";
import { Invoice } from "../../models/Invoice";

type InvoicePaymentVoucherEntryBy = "creator" | "accountant";

type InvoicePaymentFilterArgs = Partial<{
	creator: UserLookup;
	paymentType: PaymentType;
	bankAccount: string;
	receiptNo: string;
	foreignAccount: string;
	paymentDateFrom: string;
	paymentDateTo: string;
	caseNo: string;
	voucherNo: string;
	voucherEntryBy: InvoicePaymentVoucherEntryBy;
	dateFrom: string;
	dateTo: string;
}>;

type InvoicePaymentItemType = {
	instance: Instance;
	invoices: Invoice[];
};

export type {
	InvoicePaymentVoucherEntryBy,
	InvoicePaymentFilterArgs,
	InvoicePaymentItemType,
};
