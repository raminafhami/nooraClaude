function addCaretSymbol(text: string): string {
	return !text.startsWith("^") ? `^${text}` : text;
}

export { addCaretSymbol };
