import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

type InstanceCancelReason = "1" | "2" | "3" | "4" | "5" | "6";

const instanceCancelReason: ObjectType<
	InstanceCancelReason,
	{ title: string }
> = {
	["2"]: { title: "هزینه بازرسی" },
	["3"]: { title: "گمرک ورودی" },
	["4"]: { title: "انصراف مشتری از بازرسی" },
	["5"]: { title: "عدم وجود آزمایشگاه اکرودیته" },
	["6"]: { title: "عدم رضایت مشتری از عملکرد" },
	["1"]: { title: "سایر" },
};

const instanceCancelReasonOptions = getObjectEntries(instanceCancelReason).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export type { InstanceCancelReason };
export { instanceCancelReason, instanceCancelReasonOptions };
