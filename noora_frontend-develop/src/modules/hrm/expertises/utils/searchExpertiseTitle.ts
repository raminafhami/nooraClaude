import { ObjectType } from "@/utils/object/ObjectType";

function searchExpertiseTitle(value: string): ObjectType<"title"> {
	return {
		title: {
			$regex: value,
			$options: "i",
		},
	};
}

export { searchExpertiseTitle };
