import { UserApi } from "@/identity/users/models/User";
import parseUser from "@/identity/users/utils/parseUser";

import { Course, CourseApi } from "../models/Course";

function parseCourse(from: CourseApi): Course;

function parseCourse(from: CourseApi[]): Course[];

function parseCourse(from: CourseApi | CourseApi[]): Course | Course[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseCourse(x));
	}

	return {
		id: from.id,
		title: from.title,
		instructor: from.instructor,
		startDate: new Date(from.startDate),
		endDate: new Date(from.endDate),
		time: from.time,
		place: from.place,
		status: from.status,
		participantIds: from.users
			? from.users.length
				? typeof from.users[0] === "string"
					? (from.users as string[])
					: (from.users as UserApi[]).map((x) => x.id)
				: []
			: undefined,
		participantsCount: from.participantNo,

		participants: from.users
			? from.users.length
				? typeof from.users[0] === "object"
					? parseUser(from.users as UserApi[])
					: undefined
				: []
			: undefined,
	};
}

export { parseCourse };
