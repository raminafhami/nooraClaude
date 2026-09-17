import { Buyer } from "@/buyers/models/Buyer";
import { Currency } from "@/enums/Currency";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { PaymentRuleApi } from "@/financial/payment-rules/models/PaymentRule";
import { UserApi } from "@/identity/users/models/User";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import { CostCaseStatus } from "../enums/CostCaseStatus";
import { CostMethod } from "../enums/CostMethod";
import { CostPeriod } from "../enums/CostPeriod";
import { CostStatus } from "../enums/CostStatus";
import { CostType } from "../enums/CostType";
import { CostPayment } from "./CostPayment";

type CostApi = {
	id: string;
	caseId: string;
	caseNo: string;
	caseStatus: CostCaseStatus;
	categoryId: FinancialCategory | string;
	title: string;
	personId: string | UserApi | null;
	personName: string | null;
	ruleId: string | PaymentRuleApi | null;
	type?: CostType;
	method?: CostMethod;
	amount?: string;
	currency?: Currency;
	currencyRate?: number;
	total: string;
	period?: CostPeriod;
	payment: CostPayment | null;
	status: CostStatus;
	description: string;
	instance: {
		name: string | null;
		createdAt: string | null;
		status: string | null;
		inspectionFee: string | null;
		buyer: Buyer | null;
		invoicePaymentStatus?: InvoicePaymentStatus | null;
	};
	person?: any | null;
};

export type { CostApi };
