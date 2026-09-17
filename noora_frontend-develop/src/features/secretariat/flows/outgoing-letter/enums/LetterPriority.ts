import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum LetterPriority {
	Normal = "normal",
	Urgent = "urgent",
}

const letterPriority: ObjectType<LetterPriority, { title: string }> = {
	[LetterPriority.Normal]: { title: "عادی" },
	[LetterPriority.Urgent]: { title: "فوری" },
};

const letterPriorityOptions: SelectItemType<LetterPriority>[] =
	getObjectEntries(letterPriority).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export { LetterPriority, letterPriority, letterPriorityOptions };
