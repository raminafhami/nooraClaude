import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum ProcessType {
	Beneficiary = "beneficiary",
	PettyCash = "petty-cash",
}

const processTypes: Record<ProcessType, { title: string }> = {
	[ProcessType.Beneficiary]: { title: "ذینفع" },
	[ProcessType.PettyCash]: { title: "تنخواه" },
};

const processTypeOptions = getObjectEntries(processTypes).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export { ProcessType, processTypes, processTypeOptions };
