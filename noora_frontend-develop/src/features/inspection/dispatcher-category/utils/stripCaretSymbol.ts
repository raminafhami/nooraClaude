function stripCaretSymbol(text: string): string {
	return text.startsWith("^") ? text.slice(1) : text;
}

export { stripCaretSymbol };
