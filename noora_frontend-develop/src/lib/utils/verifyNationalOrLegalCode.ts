import { verifyIranianLegalId, verifyIranianNationalId } from "persian-tools";

const verifyNationalOrLegalCode = (
	code: string | number | null | undefined,
): boolean => {
	if (!code) return false;
	return !!(verifyIranianNationalId(code) || verifyIranianLegalId(code));
};

export { verifyNationalOrLegalCode };
