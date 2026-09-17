import { UserApi } from "@/identity/users/models/User";

import { ProjectType } from "../enums/ProjectType";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectTaskLabel } from "./ProjectTaskLabel";

type Project = {
	id: string;
	name: string;
	statuses: string[] | ProjectStatus[];
	labels: ProjectTaskLabel[] | string[];
	members: string[] | UserApi[];
	createdBy: string | UserApi;
	createdDate: string;
	type?: ProjectType;

	totalProgress: number;
};

export type { Project };
