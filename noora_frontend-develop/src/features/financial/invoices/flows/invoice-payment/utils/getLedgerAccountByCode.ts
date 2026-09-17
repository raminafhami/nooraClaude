import { bankAccounts } from "../data/bankAccounts";
import { LedgerAccount } from "../models/LedgerAccount";

function getLedgerAccountByCode(code: string): LedgerAccount {
	const includesSlCode = code.includes("::");

	const slCode = includesSlCode ? code.split("::")[0] : undefined;
	const dlCode = includesSlCode ? code.split("::")[1] : code;

	if (!includesSlCode) {
		return bankAccounts.find((b) => b.dlCode === dlCode)!;
	}

	return bankAccounts.find((b) => b.slCode === slCode && b.dlCode === dlCode)!;
}

export { getLedgerAccountByCode };
