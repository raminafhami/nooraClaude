import { BuyerApi } from "@/buyers/models/BuyerApi";
import { ProjectTask } from "@/projects/models/ProjectTask";

import { ActivityType } from "../enums/ActivityType";

type Activity = Omit<ProjectTask, "deadline" | "buyerId"> & {
	type: ActivityType;
	deadline: string;
	buyerId?: BuyerApi | string | null;
};

export type { Activity };
