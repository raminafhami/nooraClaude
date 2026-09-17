import apiClient from "@/api/client";

import { Course, CourseApi } from "../models/Course";
import { parseCourse } from "../utils/parseCourse";

async function getCourseById(id: string): Promise<Course> {
	const response = await apiClient.get<CourseApi>({
		url: `education/courses/${id}`,
	});

	return parseCourse(response.result);
}

export { getCourseById };
