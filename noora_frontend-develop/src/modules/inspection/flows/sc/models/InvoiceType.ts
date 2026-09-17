export enum InvoiceType {
  Preinvoice = "preinvoice",
  Invoice = "invoice",
}

export const invoiceType: {
  [key in InvoiceType]: string;
} = {
  [InvoiceType.Preinvoice]: "پیش فاکتور",
  [InvoiceType.Invoice]: "فاکتور",
};

export const invoiceTypes: {
  label: string;
  value: InvoiceType;
}[] = Object.keys(invoiceType).map((k) => {
  const key = k as InvoiceType;
  return { label: invoiceType[key], value: key };
});
