import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ProjectTaskPriority {
	Low = 1,
	Medium = 2,
	High = 3,
}

const projectTaskPriority: ObjectType<ProjectTaskPriority, { title: string }> =
	{
		[ProjectTaskPriority.Low]: { title: "پایین" },
		[ProjectTaskPriority.Medium]: { title: "معمولی" },
		[ProjectTaskPriority.High]: { title: "فوری" },
	};

const projectTaskPriorityOptions: SelectItemType[] = getObjectEntries(
	projectTaskPriority,
).map(([key, { title }]) => ({
	value: key.toString(),
	label: title,
}));

export { ProjectTaskPriority, projectTaskPriority, projectTaskPriorityOptions };
