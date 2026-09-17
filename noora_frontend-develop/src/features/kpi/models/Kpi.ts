import { UserGroup } from "@/identity/groups/models/Group";
import { UserApi } from "@/identity/users/models/User";

import { KpiTargetMetric } from "../enums/KpiTargetMetric";

type KpiApi = {
	id: string;
	title: string;
	targetType: string;
	userId?: UserApi | string;
	groupId?: UserGroup | string;
	position: string;
	processKeys: string[];
	timeFrame: string;
	startDate: string;
	endDate: string;
	targets: {
		metric: KpiTargetMetric;
		value: number;
	}[];
	createdAt?: string;
	updatedAt?: string;
};

export type { KpiApi };
