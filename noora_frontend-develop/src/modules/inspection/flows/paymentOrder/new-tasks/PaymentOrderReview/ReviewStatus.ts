import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ReviewStatus {
	Accept = "accept",
	Reject = "reject",
}

const reviewStatus: ObjectType<ReviewStatus, ObjectType<"title">> = {
	[ReviewStatus.Accept]: { title: "تایید" },
	[ReviewStatus.Reject]: { title: "بازگشت برای درخواست دهنده" },
};

const reviewStatusOptions: {
	label: string;
	value: ReviewStatus;
}[] = getObjectEntries(reviewStatus).map(([key, { title }]) => ({
	value: key,
	label: title,
}));

export { ReviewStatus, reviewStatus, reviewStatusOptions };
