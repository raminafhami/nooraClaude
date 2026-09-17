function isObjectId(value: unknown): value is string {
	return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
}

export { isObjectId };
