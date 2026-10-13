import { toEnglishNum } from "./toEnglishNum";

/**
 * Normalizes user-entered Sheba (IBAN) numbers: Persian/Arabic digits are
 * converted to English, spaces and dashes (as in "IR06 0170 ...") are removed,
 * the text is upper-cased and the "IR" prefix is added when only the 24
 * digits were entered.
 */
function normalizeSheba(value: string | undefined): string {
	const sheba = (toEnglishNum(value) ?? "").replace(/[\s-]/g, "").toUpperCase();

	return /^\d{24}$/.test(sheba) ? `IR${sheba}` : sheba;
}

export { normalizeSheba };
