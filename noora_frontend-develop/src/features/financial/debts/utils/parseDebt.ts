import { parseCost } from "@/financial/costs/utils/parseCost";

import { DebtStatus } from "../enums/DebtStatus";
import { Debt } from "../models/Debt";
import { DebtApi } from "../models/DebtApi";

function parseDebt(from: DebtApi): Debt;

function parseDebt(from: DebtApi[]): Debt[];

function parseDebt(from: DebtApi | DebtApi[]): Debt | Debt[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseDebt(x));
	}

	let result: Debt = {
		id: from.id,
		instanceId: from.instanceId,
		userId: from.userId,
		caseNo: from.caseNo,
		userType: from.userType,
		amount: from.amount,
		status: from.isPaid ? DebtStatus.Paid : DebtStatus.Unpaid,
	};

	return result;
}

export { parseDebt };
