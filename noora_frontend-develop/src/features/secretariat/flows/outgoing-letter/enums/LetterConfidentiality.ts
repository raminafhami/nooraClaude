import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum LetterConfidentiality {
	Normal = "normal",
	Confidential = "confidential",
}

const letterConfidentiality: ObjectType<
	LetterConfidentiality,
	{ title: string }
> = {
	[LetterConfidentiality.Normal]: { title: "عادی" },
	[LetterConfidentiality.Confidential]: { title: "محرمانه" },
};

const letterConfidentialityOptions: SelectItemType<LetterConfidentiality>[] =
	getObjectEntries(letterConfidentiality).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export {
	LetterConfidentiality,
	letterConfidentiality,
	letterConfidentialityOptions,
};
