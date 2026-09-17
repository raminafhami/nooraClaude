import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ProjectTaskReminderMethod {
	Sms = "sms",
	WebNotification = "web-notification",
}

const projectTaskReminderMethod: ObjectType<
	ProjectTaskReminderMethod,
	ObjectType<"title">
> = {
	[ProjectTaskReminderMethod.Sms]: { title: "پیامک" },
	[ProjectTaskReminderMethod.WebNotification]: { title: "اعلان سیستمی" },
};

const projectTaskReminderMethodOptions: SelectItemType<ProjectTaskReminderMethod>[] =
	getObjectEntries(projectTaskReminderMethod).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export {
	ProjectTaskReminderMethod,
	projectTaskReminderMethod,
	projectTaskReminderMethodOptions,
};
