"use client";

import { InvoicePaymentList } from "@/financial/invoices/components/invoice-payment-list/InvoicePaymentList";
import { Head } from "@/ui/Head";

function InvoicePayments() {
	return (
		<div className="space-y-8">
			{/* <Head.Root>
				<Head.Title>فهرست پرداختی فاکتورها</Head.Title>
			</Head.Root> */}

			<InvoicePaymentList />
		</div>
	);
}

export { InvoicePayments };
