const digitsFa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toFarsiNum(n: string | number | undefined): string | undefined {
	return n?.toString().replace(/\d/g, (x: any) => digitsFa[x]);
}

export { toFarsiNum };
