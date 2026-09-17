import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ReviewStatus {
	Forward = "forward",
	ReturnCreator = "return-creator",
}

const reviewStatus: ObjectType<ReviewStatus, ObjectType<"title">> = {
	[ReviewStatus.Forward]: { title: "تایید" },
	[ReviewStatus.ReturnCreator]: { title: "بازگشت برای اصلاح" },
};

const reviewStatusOptions: {
	label: string;
	value: ReviewStatus;
}[] = getObjectEntries(reviewStatus).map(([key, { title }]) => ({
	value: key,
	label: title,
}));

export { ReviewStatus, reviewStatus, reviewStatusOptions };
