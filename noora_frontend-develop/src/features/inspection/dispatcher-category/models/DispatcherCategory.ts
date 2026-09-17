import { DispatcherCategoryType } from "../enums/DispatcherCategoryType";

type DispatcherCategory = {
	_id: string;
	type: DispatcherCategoryType;
	domainCode: string;
	inspectionDomain: string;
	include: string[];
	exclude: string[];
};

export type { DispatcherCategory };
