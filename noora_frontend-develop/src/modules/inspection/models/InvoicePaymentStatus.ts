export enum InvoicePaymentStatus {
	Unpaid = "unpaid",
	Pending = "pending",
	PartiallyPaid = "partiallyPaid",
	Paid = "paid",
}

export const invoicePaymentStatus: {
	[key in InvoicePaymentStatus]: string;
} = {
	[InvoicePaymentStatus.Unpaid]: "پرداخت نشده",
	[InvoicePaymentStatus.Pending]: "در انتظار بررسی",
	[InvoicePaymentStatus.PartiallyPaid]: "ناقص پرداخت شده",
	[InvoicePaymentStatus.Paid]: "پرداخت شده",
};
