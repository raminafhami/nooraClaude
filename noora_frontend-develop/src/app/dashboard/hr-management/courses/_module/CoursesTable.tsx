"use client";

import { ReactNode } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Course } from "@/courses/models/Course";

import { CoursesTableRow } from "./CoursesTableRow";

function CoursesTable({
	courses,
	loading,
	offset,
	pagination,
}: {
	courses: Course[];
	loading: boolean;
	offset: number;
	pagination: ReactNode;
}) {
	return (
		<>
			<Table
				loading={loading}
				pagination={pagination}
				slotProps={{
					root: { className: "border-x-0 rounded-none" },
				}}
			>
				<TableHeader>
					<TableRow>
						<TableHead className="w-1">#</TableHead>
						<TableHead className="w-96 xl:w-auto">نام دوره</TableHead>
						<TableHead className="w-36">وضعیت</TableHead>
						<TableHead className="w-56">مدرس</TableHead>
						<TableHead className="w-44">تعداد شرکت کنندگان</TableHead>
						<TableHead className="w-44">تاریخ برگزاری</TableHead>
						<TableHead className="w-36">مدت زمان</TableHead>
						<TableHead className="w-56">مکان برگزاری</TableHead>
						<TableHead className="w-1">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{courses.length ? (
						courses.map((course, index) => (
							<CoursesTableRow
								key={course.id}
								course={course}
								index={offset + index}
							/>
						))
					) : (
						<TableRow>
							<TableCell colSpan={100}>موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}

export { CoursesTable };
