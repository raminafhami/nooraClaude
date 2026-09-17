import { INVOICE_NO_PREFIX } from "../InvoicesConsts";

function getInvoiceNoSequence(invoiceNo: string): string {
	return INVOICE_NO_PREFIX
		? invoiceNo.replace(INVOICE_NO_PREFIX, "")
		: invoiceNo;
}

export { getInvoiceNoSequence };
