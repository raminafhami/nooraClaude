function isLockedIncomeErrorMessage(err: any) {
	return err?.message === "Income is progressing";
}

export { isLockedIncomeErrorMessage };
