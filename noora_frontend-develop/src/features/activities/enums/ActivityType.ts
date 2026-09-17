import { IconType } from "react-icons";
import { FaHandshake, FaListCheck, FaPhone } from "react-icons/fa6";

import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ActivityType {
	Call = "call",
	Meeting = "meeting",
	Task = "task",
}

const activityTypes: ObjectType<
	ActivityType,
	{ title: string; pluralTitle: string; icon: IconType }
> = {
	[ActivityType.Call]: {
		title: "تماس",
		pluralTitle: "تماس ها",
		icon: FaPhone,
	},
	[ActivityType.Meeting]: {
		title: "جلسه",
		pluralTitle: "جلسات",
		icon: FaHandshake,
	},
	[ActivityType.Task]: {
		title: "کار",
		pluralTitle: "کارها",
		icon: FaListCheck,
	},
};

const activityTypeOptions: SelectItemType[] = getObjectEntries(
	activityTypes,
).map(([key, { title }]) => ({ value: key, label: title }));

export { ActivityType, activityTypes, activityTypeOptions };
