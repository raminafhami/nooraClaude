export function toCurrency(str: string): string;

export function toCurrency(str: undefined): undefined;

export function toCurrency(str: string | undefined): string | undefined {
	return str?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function toPostalCode(str: string): string {
	return str.replace(/(.{5})/, "$1-");
}

export function toPhoneNo(str: string): string {
	return str.replace(/(.{3})/, "$1-");
}
