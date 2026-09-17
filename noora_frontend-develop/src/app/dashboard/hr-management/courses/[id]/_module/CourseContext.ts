"use client";

import { createContext } from "react";

import { Course } from "@/courses/models/Course";

type CourseContextType = {
	course: Course;
	handleCourseUpdate: (course: Partial<Course>) => void;
};

const CourseContext = createContext<CourseContextType>({} as CourseContextType);

export { type CourseContextType, CourseContext };
