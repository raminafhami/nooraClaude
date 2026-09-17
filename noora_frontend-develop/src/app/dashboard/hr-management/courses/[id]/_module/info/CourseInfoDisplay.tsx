"use client";

import moment from "jalali-moment";

import { CardContent } from "@/components/ui/card";
import { courseStatus } from "@/courses/enums/CourseStatus";

import { useCourseContext } from "../useCourseContext";

function CourseInfoDisplay() {
	const { course } = useCourseContext();

	const startDate = moment(course.startDate).format("jYYYY/jMM/jDD");
	const endDate = moment(course.endDate).format("jYYYY/jMM/jDD");
	const isOneDate = startDate === endDate;

	return (
		<CardContent className="grid grid-cols-12 gap-6">
			<div className="col-span-full !col-start-1 space-y-2">
				<div className="text-muted-foreground">عنوان:</div>
				<div>{course.title}</div>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">مدرس:</div>
				<div>{course.instructor}</div>
			</div>

			{isOneDate ? (
				<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
					<div className="text-muted-foreground">تاریخ:</div>
					<div>{startDate}</div>
				</div>
			) : (
				<>
					<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
						<div className="text-muted-foreground">تاریخ شروع:</div>
						<div>{startDate}</div>
					</div>

					<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
						<div className="text-muted-foreground">تاریخ پایان:</div>
						<div>{endDate}</div>
					</div>
				</>
			)}

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">زمان:</div>
				<div>{course.time}</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">مکان:</div>
				<div>{course.place}</div>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">وضعیت:</div>
				<div>{courseStatus[course.status].title}</div>
			</div>
		</CardContent>
	);
}

export { CourseInfoDisplay };
