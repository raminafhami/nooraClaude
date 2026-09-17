import { User, UserApi } from "@/identity/users/models/User";

import { CourseStatus } from "../enums/CourseStatus";

type Course = {
	id: string;
	title: string;
	instructor: string;
	startDate: Date;
	endDate: Date;
	time: string;
	place: string;
	status: CourseStatus;
	participantIds?: string[];
	participantsCount: number;

	participants?: User[];
};

type CourseApi = {
	id: string;
	title: string;
	instructor: string;
	startDate: string;
	endDate: string;
	time: string;
	place: string;
	status: CourseStatus;
	users?: string[] | UserApi[];
	participantNo: number;
};

export type { Course, CourseApi };
