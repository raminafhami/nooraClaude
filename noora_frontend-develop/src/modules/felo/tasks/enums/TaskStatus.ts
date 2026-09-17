import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum TaskStatus {
	Todo = "todo",
	OnHold = "on-hold",
	Done = "done",
}

const taskStatus: ObjectType<TaskStatus, ObjectType<"title">> = {
	[TaskStatus.Todo]: { title: "در انتظار" },
	[TaskStatus.OnHold]: { title: "متوقف شده" },
	[TaskStatus.Done]: { title: "انجام شده" },
};

const taskStatusOptions: SelectItemType<TaskStatus>[] = getObjectEntries(
	taskStatus,
).map(([key, { title }]) => ({ value: key, label: title }));

export { TaskStatus, taskStatus, taskStatusOptions };
