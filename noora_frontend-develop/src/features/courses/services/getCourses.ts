import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Course, CourseApi } from "../models/Course";
import {
	CourseBaseQuery,
	CoursePageQuery,
	CourseQuery,
} from "../models/CourseQuery";
import { parseCourse } from "../utils/parseCourse";

async function getCourses(options?: CourseBaseQuery): Promise<Course[]>;

async function getCourses(
	options: CoursePageQuery,
): Promise<EntityPageResult<Course>>;

async function getCourses(
	options: CourseQuery = {},
): Promise<Course[] | EntityPageResult<Course>> {
	const response = await apiClient.query<CourseApi>({
		url: "education/courses",
		queryOptions: options,
	});

	if (!options.pagination) {
		return parseCourse(response.result.data);
	}

	return {
		items: parseCourse(response.result.data),
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getCourses };
