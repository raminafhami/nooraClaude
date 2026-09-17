import { ObjectType } from "@/utils/object/ObjectType";

import { CostServiceAccessType } from "./CostServiceAccessType";

enum CostService {
	Agency = "agency",
	Coordinator = "coordinator",
	Marketer = "marketer",
	Customer = "customer",
	TechExpert = "technical-expert",
	SeniorExpert = "senior-expert",
	TechManager = "technical-manager",
	Insurance = "insurance",
	Inspection = "inspection",
	Lab = "lab",
	Post = "post",
	Courier = "courier",
	Equipment = "equipment",
	Copartner = "copartner",
	Misc = "misc",
}

type CostServiceConfig = {
	accessType: CostServiceAccessType;
	isPartial?: boolean;
	isEditable?: boolean;
	isDeletable?: boolean;
	isMultiple?: boolean;
};

const costService: ObjectType<CostService, CostServiceConfig> = {
	[CostService.Agency]: {
		accessType: CostServiceAccessType.Confidential,
		isPartial: true,
	},
	[CostService.Coordinator]: {
		accessType: CostServiceAccessType.Confidential,
		isPartial: true,
	},
	[CostService.Marketer]: {
		accessType: CostServiceAccessType.Confidential,
		isPartial: true,
	},
	[CostService.Customer]: {
		accessType: CostServiceAccessType.Open,
		isPartial: true,
	},
	[CostService.TechExpert]: {
		accessType: CostServiceAccessType.Confidential,
		isPartial: true,
	},
	[CostService.SeniorExpert]: {
		accessType: CostServiceAccessType.Confidential,
		isPartial: true,
	},
	[CostService.TechManager]: {
		accessType: CostServiceAccessType.Confidential,
		isPartial: true,
	},
	[CostService.Insurance]: {
		accessType: CostServiceAccessType.Open,
		isEditable: false,
	},
	[CostService.Inspection]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
	[CostService.Lab]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
	[CostService.Post]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
	[CostService.Courier]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
	[CostService.Equipment]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
	[CostService.Copartner]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
	[CostService.Misc]: {
		accessType: CostServiceAccessType.Open,
		isDeletable: true,
		isMultiple: true,
	},
};

export { CostService, costService };
export type { CostServiceConfig };
