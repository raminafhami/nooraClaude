import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum DispatcherCategoryType {
	TwentyTwo = "22",
	Five = "5",
	Fourteen = "14",
}

const dispatcherCategoryTypes: Record<
	DispatcherCategoryType,
	{ title: string }
> = {
	[DispatcherCategoryType.TwentyTwo]: { title: "بیست و دو گانه" },
	[DispatcherCategoryType.Five]: { title: "پنج گانه" },
	[DispatcherCategoryType.Fourteen]: { title: "چهارده گانه" },
};

const dispatcherCategoryTypeOptions = getObjectEntries(
	dispatcherCategoryTypes,
).map(([key, { title }]) => ({ value: key, label: title }));

export {
	DispatcherCategoryType,
	dispatcherCategoryTypes,
	dispatcherCategoryTypeOptions,
};
