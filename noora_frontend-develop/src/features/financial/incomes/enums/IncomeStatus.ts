import { ObjectType } from "@/utils/object/ObjectType";

enum IncomeStatus {
	Unpaid = "unpaid",
	Pending = "pending",
	PartiallyPaid = "partially",
	Paid = "paid",
	Cancelled = "canceled",
}

const incomeStatus: ObjectType<IncomeStatus, { title: string }> = {
	[IncomeStatus.Unpaid]: { title: "پرداخت نشده" },
	[IncomeStatus.Pending]: { title: "در انتظار پرداخت" },
	[IncomeStatus.PartiallyPaid]: { title: "پرداخت ناقص" },
	[IncomeStatus.Paid]: { title: "وصول شده" },
	[IncomeStatus.Cancelled]: { title: "لغو شده" },
};

export { IncomeStatus, incomeStatus };
