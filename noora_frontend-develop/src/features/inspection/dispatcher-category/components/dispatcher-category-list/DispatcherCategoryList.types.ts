import { DispatcherCategoryType } from "../../enums/DispatcherCategoryType";

type DispatcherCategoryFilterArgs = Partial<{
	company: boolean;
	type: DispatcherCategoryType;
	domainCode: string;
	inspectionDomain: string;
	// code: string;
}>;

export type { DispatcherCategoryFilterArgs };
