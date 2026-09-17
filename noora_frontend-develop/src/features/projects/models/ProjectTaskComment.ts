import { UserApi } from "@/identity/users/models/User";

type ProjectTaskComment = {
	id: string;
	text: string;
	projectTaskId: string;
	createdAt: string;
	createdBy: string | UserApi;
};

export type { ProjectTaskComment };
