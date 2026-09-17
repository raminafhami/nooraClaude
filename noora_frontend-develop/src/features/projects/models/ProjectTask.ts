import { BuyerApi } from "@/buyers/models/BuyerApi";
import { UserApi } from "@/identity/users/models/User";

import { ProjectTaskReminderMethod } from "../enums/ProjectTaskReminderMethod";
import { Project } from "./Project";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectTaskLabel } from "./ProjectTaskLabel";

type ProjectTask = {
	id: string;
	title: string;
	taskNo: string;
	description?: string;
	status: string | ProjectStatus;
	assignee: UserApi | string;
	project: string | Project;
	labels: ProjectTaskLabel[] | string[];
	deadline?: string;
	priority: number;
	progress: number;
	order: number;
	createdAt: string;
	createdBy: string | UserApi;
	buyerId?: string | BuyerApi;
	customerId?: string;
	isConfidential: boolean;
	reminder?: string;
	reminderMethod?: ProjectTaskReminderMethod;
};

export type { ProjectTask };
