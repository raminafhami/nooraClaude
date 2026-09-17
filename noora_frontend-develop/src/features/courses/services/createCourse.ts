import apiClient from "@/api/client";

import { CourseStatus } from "../enums/CourseStatus";
import { Course, CourseApi } from "../models/Course";
import { parseCourse } from "../utils/parseCourse";

interface CreateCourseDto {
	title: string;
	instructor: string;
	startDate: string | Date;
	endDate: string | Date;
	time: string;
	place: string;
	status: CourseStatus;
	users?: string[];
}

type CreateCourseApi = {
	title: string;
	instructor: string;
	startDate: string;
	endDate: string;
	time: string;
	place: string;
	status: CourseStatus;
	users?: string[];
};

async function createCourse(input: CreateCourseDto): Promise<Course> {
	const data: CreateCourseApi = {
		title: input.title.trim(),
		instructor: input.instructor.trim(),
		startDate:
			typeof input.startDate === "string"
				? input.startDate
				: input.startDate.toISOString(),
		endDate:
			typeof input.endDate === "string"
				? input.endDate
				: input.endDate.toISOString(),
		time: input.time.trim(),
		place: input.place.trim(),
		status: input.status,
		users: input.users,
	};

	const response = await apiClient.post<CourseApi>({
		url: "education/courses",
		body: data,
	});

	return parseCourse(response.result);
}

export { createCourse };
