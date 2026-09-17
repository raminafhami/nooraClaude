import { Buyer } from "@/buyers/models/Buyer";
import { Currency } from "@/enums/Currency";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { User } from "@/identity/users/models/User";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import { CostCaseStatus } from "../enums/CostCaseStatus";
import { CostMethod } from "../enums/CostMethod";
import { CostPeriod } from "../enums/CostPeriod";
import { CostStatus } from "../enums/CostStatus";
import { CostType } from "../enums/CostType";
import { CostPayment } from "./CostPayment";

type Cost = {
	id: string;
	caseId: string;
	caseNo: string;
	caseStatus: CostCaseStatus;
	categoryId: string;
	title: string;
	personId: string | null;
	personName: string | null;
	ruleId?: string | null;
	type: CostType | null;
	method: CostMethod | null;
	amount: string;
	currency: Currency | null;
	currencyRate: number | null;
	total: string;
	period: CostPeriod | null;
	payment: CostPayment | null;
	status: CostStatus;
	description: string;

	category?: FinancialCategory;
	person?: User | null;
	rule?: PaymentRule | null;
	instance?: {
		name: string;
		status: string;
		inspectionFee: string;
		buyer: Buyer;
		createdAt: string;
		invoicePaymentStatus: InvoicePaymentStatus;
	};
};

export type { Cost };
