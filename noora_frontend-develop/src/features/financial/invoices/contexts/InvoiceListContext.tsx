"use client";

import { createContext, useContext } from "react";

import { Invoice } from "../models/Invoice";

type InvoiceListContextType = {
	isPending: boolean;
	editInvoice?: (invoice: Invoice) => void;
	forceEditInvoice?: (invoice: Invoice) => void;
	issueOne: (invoice: Invoice) => Promise<void>;
	cancelOne?: (invoice: Invoice) => void;
};

const InvoiceListContext = createContext<InvoiceListContextType>({
	isPending: false,
	issueOne: async () => {},
});

function useInvoiceListContext(): InvoiceListContextType {
	return useContext(InvoiceListContext);
}

export { InvoiceListContext, useInvoiceListContext };
export type { InvoiceListContextType };
