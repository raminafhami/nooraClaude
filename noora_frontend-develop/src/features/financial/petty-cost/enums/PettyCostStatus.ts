import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum PettyCostStatus {
	Unpaid = "unpaid",
	Pending = "pending",
	Paid = "paid",
}

const pettyCostStatuses: Record<PettyCostStatus, { title: string }> = {
	[PettyCostStatus.Unpaid]: { title: "پرداخت نشده" },
	[PettyCostStatus.Pending]: { title: "در دست بررسی" },
	[PettyCostStatus.Paid]: { title: "پرداخت شده" },
};

const pettyCostStatusOptions = getObjectEntries(pettyCostStatuses).map(
	([key, { title }]) => ({
		label: title,
		value: key,
	}),
);

export { PettyCostStatus, pettyCostStatuses, pettyCostStatusOptions };
