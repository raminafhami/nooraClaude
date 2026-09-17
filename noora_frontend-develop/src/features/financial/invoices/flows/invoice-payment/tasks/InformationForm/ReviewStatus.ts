import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ReviewStatus {
	Forward = "forward",
	AutoDocument = "auto-document",
	Cancel = "cancel",
}

const reviewStatus: ObjectType<ReviewStatus, ObjectType<"title">> = {
	[ReviewStatus.Forward]: { title: "ارسال برای مالی" },
	[ReviewStatus.AutoDocument]: { title: "ثبت سند خودکار" },
	[ReviewStatus.Cancel]: { title: "لغو درخواست" },
};

const reviewStatusOptions: {
	label: string;
	value: ReviewStatus;
}[] = getObjectEntries(reviewStatus).map(([key, { title }]) => ({
	value: key,
	label: title,
}));

export { ReviewStatus, reviewStatus, reviewStatusOptions };
