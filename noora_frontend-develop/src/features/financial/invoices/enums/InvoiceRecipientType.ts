import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum InvoiceRecipientType {
	Natural = "natural",
	Legal = "legal",
}

const invoiceRecipientTypes: Record<InvoiceRecipientType, { title: string }> = {
	[InvoiceRecipientType.Natural]: { title: "حقیقی" },
	[InvoiceRecipientType.Legal]: { title: "حقوقی" },
};

const invoiceRecipientTypeOptions = getObjectEntries(invoiceRecipientTypes).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export {
	InvoiceRecipientType,
	invoiceRecipientTypes,
	invoiceRecipientTypeOptions,
};
