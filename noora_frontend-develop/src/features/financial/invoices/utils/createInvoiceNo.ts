import { INVOICE_NO_PREFIX } from "../InvoicesConsts";

function createInvoiceNo(sequence: number | string): string {
	return `${INVOICE_NO_PREFIX}${sequence}`;
}

export { createInvoiceNo };
