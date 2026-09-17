function toEnglishNum(n: string | number | undefined): string | undefined {
	return n
		?.toString()
		.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, (x: any) =>
			(x.charCodeAt(0) & 0xf).toString(),
		);
}

export { toEnglishNum };
