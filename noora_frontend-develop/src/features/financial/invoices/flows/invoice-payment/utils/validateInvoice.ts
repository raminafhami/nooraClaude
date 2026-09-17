import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { InvoiceRecipient } from "@/financial/invoices/models/InvoiceRecipient";

function validateInvoice(
	invoice: Invoice | undefined,
	invoiceType: string | undefined,
	invoiceRecipient: InvoiceRecipient | undefined,
): string | true {
	if (!invoice) {
		throw "فاکتور مورد نظر یافت نشد.";
	}

	if (invoiceType && invoice.type !== invoiceType) {
		return "فاکتور مورد نظر از لحاظ نوع فاکتور دارای مغایرت است.";
	}

	if (
		invoiceRecipient?.refId &&
		invoice.recipient.refId !== invoiceRecipient.refId
	) {
		return "فاکتور مورد نظر از لحاظ گیرنده دارای مغایرت است.";
	}

	const validStatuses = [
		InvoiceStatus.Active,
		InvoiceStatus.Issued,
		InvoiceStatus.PartiallyPaid,
	];

	if (!validStatuses.includes(invoice.status)) {
		return "فاکتور مورد نظر در مرحله مجاز جهت ثبت وصول نیست.";
	}

	return true;
}

export { validateInvoice };
