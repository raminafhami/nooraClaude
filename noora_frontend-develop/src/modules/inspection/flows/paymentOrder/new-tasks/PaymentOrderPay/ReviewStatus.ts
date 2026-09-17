import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ReviewStatus {
	Forward = "nextStep",
	ReturnManager = "manager",
	ReturnCreator = "requestMaker",
}

const reviewStatus: ObjectType<ReviewStatus, ObjectType<"title">> = {
	[ReviewStatus.Forward]: { title: "تایید" },
	[ReviewStatus.ReturnManager]: { title: "بازگشت برای مدیر" },
	[ReviewStatus.ReturnCreator]: { title: "بازگشت برای درخواست دهنده" },
};

const reviewStatusOptions: {
	label: string;
	value: ReviewStatus;
}[] = getObjectEntries(reviewStatus).map(([key, { title }]) => ({
	value: key,
	label: title,
}));

export { ReviewStatus, reviewStatus, reviewStatusOptions };
