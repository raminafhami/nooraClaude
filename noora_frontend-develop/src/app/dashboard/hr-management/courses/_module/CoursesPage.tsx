"use client";

import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { CourseStatus } from "@/courses/enums/CourseStatus";
import { Course } from "@/courses/models/Course";
import { CourseQueryFilter } from "@/courses/models/CourseQuery";
import { getCourses } from "@/courses/services/getCourses";
import { Head } from "@/ui/Head";

import { CoursesFilter } from "./CoursesFilter";
import { CoursesTable } from "./CoursesTable";
import { CourseUpsertDialog } from "./CourseUpsertDialog";

function CoursesPage() {
	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
		status: CourseStatus | null;
	}>({
		searchTerm: "",
		status: null,
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			let filters: CourseQueryFilter = {};

			if (queryFilters.searchTerm.trim()) {
				filters.$or = [
					{ title: { $regex: queryFilters.searchTerm, $options: "i" } },
					{ instructor: { $regex: queryFilters.searchTerm, $options: "i" } },
				];
			}

			if (queryFilters.status) {
				filters.status = queryFilters.status;
			}

			const courses = await getCourses({
				filters,
				pagination: { page, pageSize },
			});

			return [courses.items, courses.total] as [Course[], number];
		},
		[queryFilters.searchTerm, queryFilters.status],
	);

	const { items, isLoading, error, offset, refetch, Pagination } =
		usePagination<Course>(queryFn);

	const [createDialog, setCreateDialog] = useState<boolean>(false);

	const handleCreateDialogOpen = useCallback(() => {
		setCreateDialog(true);
	}, []);

	const handleCreateDialogClose = useCallback(
		(result?: Course) => {
			setCreateDialog(false);
			refetch();
		},
		[refetch],
	);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>لیست دوره های آموزشی</Head.Title>
				<Head.Nav className="sm:ms-auto">
					<Button variant="primary" onClick={handleCreateDialogOpen}>
						<FaPlus />
						<span>ایجاد دوره جدید</span>
					</Button>
				</Head.Nav>
			</Head.Root>

			<Card>
				<CardContent className="px-0 pt-6">
					<CoursesFilter
						queryFilters={queryFilters}
						setQueryFilters={setQueryFilters}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="px-0 pt-6">
					<CoursesTable
						courses={items}
						loading={isLoading}
						offset={offset}
						pagination={<Pagination />}
					/>
				</CardContent>
			</Card>

			<CourseUpsertDialog
				open={createDialog}
				onClose={handleCreateDialogClose}
			/>
		</div>
	);
}

export { CoursesPage };
