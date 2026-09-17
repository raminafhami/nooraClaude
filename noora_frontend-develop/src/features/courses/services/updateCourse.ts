import apiClient from "@/api/client";

import { CourseStatus } from "../enums/CourseStatus";
import { Course, CourseApi } from "../models/Course";
import { parseCourse } from "../utils/parseCourse";

interface UpdateCourseDto
	extends Partial<{
		title: string;
		instructor: string;
		startDate: string | Date;
		endDate: string | Date;
		time: string;
		place: string;
		status: CourseStatus;
	}> {}

type UpdateCourseApi = Partial<{
	title: string;
	instructor: string;
	startDate: string;
	endDate: string;
	time: string;
	place: string;
	status: CourseStatus;
}>;

async function updateCourse(
	id: string,
	input: UpdateCourseDto,
): Promise<Course> {
	const data: UpdateCourseApi = {};

	if (typeof input.title !== "undefined") {
		data.title = input.title.trim();
	}

	if (typeof input.instructor !== "undefined") {
		data.instructor = input.instructor.trim();
	}

	if (typeof input.startDate !== "undefined") {
		data.startDate =
			typeof input.startDate === "string"
				? input.startDate
				: input.startDate.toISOString();
	}

	if (typeof input.endDate !== "undefined") {
		data.endDate =
			typeof input.endDate === "string"
				? input.endDate
				: input.endDate.toISOString();
	}

	if (typeof input.time !== "undefined") {
		data.time = input.time.trim();
	}

	if (typeof input.place !== "undefined") {
		data.place = input.place.trim();
	}

	if (typeof input.status !== "undefined") {
		data.status = input.status;
	}

	const response = await apiClient.put<CourseApi>({
		url: `education/courses/${id}`,
		body: data,
	});

	return parseCourse(response.result);
}

export { updateCourse };
