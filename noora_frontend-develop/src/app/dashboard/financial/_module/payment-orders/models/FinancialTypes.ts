import { UserLookup } from "../../../../inspection/_module/instance-search/modules/UserLookup";

export interface FinancialTypes {
	data: Datum[];
	count: number;
}

export interface Datum {
	processDefinitionId: ProcessDefinitionID;
	processDefinitionKey: ProcessDefinitionKey;
	processDefinitionName: ProcessDefinitionName;
	caseNo: string;
	currentState: CurrentState;
	stateList: StateList[];
	status: Status;
	createdAt: Date;
	updatedAt: Date;
	parameters?: Parameters;
	id: string;
}

export enum CurrentState {
	Empty = "",
	PaymentOrderCancel = "paymentOrder-cancel",
	PaymentOrderPaid = "paymentOrder-paid",
	PaymentOrderPay = "paymentOrder-pay",
	PaymentOrderRequest = "paymentOrder-request",
	PaymentOrderReview = "paymentOrder-review",
}

export interface Parameters {
	Amount: string;
	Title: string;
	Description: string;
	Priority: string;
	ProcessType: null | string;
	Currency: string;
	UserInformation?: UserInformation;
	PaymentDate?: string;
	UserData?: string;
	State?: string;
	ReviewDes?: null;
	ExpertState?: string;
	PaidAmount?: PaidAmount[];
	PayDes?: null;
	IsCancel?: null;
}

export interface PaidAmount {
	value: string;
	rate: string;
	currency: string;
	isDocument: boolean;
}

export interface UserInformation {
	branchId: null;
	sepidarId: null;
	postalCode: null;
	address: null;
	loginType: string;
	name: string;
	lastname: string;
	username: string;
	email: string;
	phoneNo: string;
	type: string;
	groups: Array<GroupClass | string>;
	nationalCode: string;
	bankAccountNumber: null | string;
	bankAccountOwner: string;
	bankCardNumber: string;
	bankSheba: string;
	credit: number;
	isActive: boolean;
	id: string;
	userFiles?: { [key: string]: null | string }[];
	image?: { [key: string]: null | string };
}

export interface GroupClass {
	title: string;
	name: string;
	type: Type;
	id: string;
}

export enum Type {
	Group = "group",
	Role = "role",
}

export enum ProcessDefinitionID {
	The66A7Ba5Cb2615Aa9Cfb883E0 = "66a7ba5cb2615aa9cfb883e0",
}

export enum ProcessDefinitionKey {
	PaymentOrder = "paymentOrder",
}

export enum ProcessDefinitionName {
	دستورپرداخت = "دستور پرداخت",
}

export interface StateList {
	name: CurrentState;
	title: Title;
}

export enum Title {
	درخواستپرداخت = "درخواست پرداخت",
	دردستبررسی = "در دست بررسی",
	دردستپرداخت = "در دست پرداخت",
	لغوشده = "لغو شده",
	پرداختشده = "پرداخت شده",
}

export enum Status {
	Active = "active",
	Completed = "completed",
}

export interface FinancialSearchProps {
	user?: UserLookup;
	type?: Array<{ value: string; label: string }>;
	priority?: Array<{ value: string; label: string }>;
	status?: Array<{ value: string; label: string }>;
	title?: string;
	caseNo?: string;
}

export const PaymentOrderStates = [
	{
		value: "paymentOrder-request",
		label: "درخواست پرداخت",
	},
	{
		value: "paymentOrder-review",
		label: "در دست بررسی",
	},
	{
		value: "paymentOrder-pay",
		label: "در دست پرداخت",
	},
	{
		value: "paymentOrder-cancel",
		label: "لغو شده",
	},
	{
		value: "paymentOrder-paid",
		label: "پرداخت شده",
	},
];
