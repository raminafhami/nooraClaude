function isBlob(value: unknown): value is Blob {
	if (typeof Blob === "undefined") return false;

	return value instanceof Blob || toString.call(value) === "[object Blob]";
}

export { isBlob };
