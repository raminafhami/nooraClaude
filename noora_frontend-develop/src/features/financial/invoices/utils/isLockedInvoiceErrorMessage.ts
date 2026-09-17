function isLockedInvoiceErrorMessage(err: any) {
	return err?.message === "Invoice is progressing";
}

export { isLockedInvoiceErrorMessage };
