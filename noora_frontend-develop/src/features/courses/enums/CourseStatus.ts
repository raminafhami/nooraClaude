import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum CourseStatus {
	NotStarted = "notStarted",
	Started = "started",
	Ended = "ended",
}

const courseStatus: ObjectType<CourseStatus, ObjectType<"title">> = {
	[CourseStatus.NotStarted]: { title: "شروع نشده" },
	[CourseStatus.Started]: { title: "شروع شده" },
	[CourseStatus.Ended]: { title: "پایان یافته" },
};

const courseStatusOptions: SelectItemType<CourseStatus>[] = getObjectEntries(
	courseStatus,
).map(([key, { title }]) => ({ value: key, label: title }));

export { CourseStatus, courseStatus, courseStatusOptions };
