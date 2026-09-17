"use client";

import moment from "jalali-moment";
import { FaEye } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { CourseStatusBadge } from "@/courses/components/CourseStatusBadge";
import { Course } from "@/courses/models/Course";

function CoursesTableRow({ course, index }: { course: Course; index: number }) {
	const startDate = moment(course.startDate).format("jYYYY/jMM/jDD");
	const endDate = moment(course.endDate).format("jYYYY/jMM/jDD");

	const isOneDate = startDate === endDate;

	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>
				<DynamicLink href={`/dashboard/hr-management/courses/${course.id}`}>
					<div className="min-w-64 max-w-96 whitespace-normal xl:min-w-min xl:max-w-max">
						{course.title}
					</div>
				</DynamicLink>
			</TableCell>
			<TableCell>
				<CourseStatusBadge status={course.status} />
			</TableCell>
			<TableCell>{course.instructor}</TableCell>
			<TableCell>
				{course.participantsCount ? `${course.participantsCount} نفر` : "-"}
			</TableCell>
			<TableCell>
				{isOneDate ? (
					<span className="tracking-wide">{startDate}</span>
				) : (
					<div className="space-y-2">
						<div>
							از <span className="tracking-wide">{startDate}</span>
						</div>
						<div>
							تا <span className="tracking-wide">{endDate}</span>
						</div>
					</div>
				)}
			</TableCell>
			<TableCell>{course.time || "-"}</TableCell>
			<TableCell>{course.place || "-"}</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<TableAction>
							<Tooltip>
								<TooltipTrigger asChild>
									<DynamicLink
										className="flex h-full items-center"
										href={`/dashboard/hr-management/courses/${course.id}`}
									>
										<Button
											className="h-full focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
											size="icon"
											variant="ghost"
										>
											<FaEye />
										</Button>
									</DynamicLink>
								</TooltipTrigger>
								<TooltipContent>مشاهده دوره</TooltipContent>
							</Tooltip>
						</TableAction>
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

export { CoursesTableRow };
