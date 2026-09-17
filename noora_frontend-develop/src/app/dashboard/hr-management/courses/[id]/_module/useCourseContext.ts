"use client";

import { useContext } from "react";

import { CourseContext, CourseContextType } from "./CourseContext";

function useCourseContext(): CourseContextType {
	return useContext(CourseContext);
}

export { useCourseContext };
