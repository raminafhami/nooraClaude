import { InvoiceRecipientType } from "../enums/InvoiceRecipientType";

type InvoiceRecipient = {
	refId?: string;
	name: string;
	lastname?: string;
	type?: InvoiceRecipientType;
	nationalCode?: string;
	economicCode?: string;
	registrationNo?: string;
	postalCode?: string;
	phone?: string;
	fax?: string;
	address?: string;
};

export type { InvoiceRecipient };
