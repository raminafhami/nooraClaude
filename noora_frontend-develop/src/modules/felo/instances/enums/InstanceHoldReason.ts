import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

type InstanceHoldReason = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";

const instanceHoldReason: ObjectType<InstanceHoldReason, { title: string }> = {
	["2"]: { title: "درخواست نامه پذیرش" },
	["3"]: { title: "در انتظار تکمیل مدارک" },
	["4"]: { title: "در انتظار تایید مشتری" },
	["5"]: { title: "در انتظار گزارش بازرسی" },
	["6"]: { title: "در انتظار جواب آزمون" },
	["7"]: { title: "در انتظار تایید صدور گواهی" },
	["8"]: { title: "در انتظار پرداخت/مالی" },
	["1"]: { title: "سایر" },
};

const instanceHoldReasonOptions = getObjectEntries(instanceHoldReason).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export type { InstanceHoldReason };
export { instanceHoldReason, instanceHoldReasonOptions };
