import { ObjectType } from "@/utils/object/ObjectType";

enum CostStatus {
	Unpaid = "unpaid",
	Pending = "pending",
	Paid = "paid",
}

const costStatus: ObjectType<CostStatus> = {
	[CostStatus.Unpaid]: "پرداخت نشده",
	[CostStatus.Pending]: "در حال پرداخت",
	[CostStatus.Paid]: "پرداخت شده",
};

export { CostStatus, costStatus };
