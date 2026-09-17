"use client";

import { useCallback, useState } from "react";

import { usePagination } from "@/components/ui/pagination/usePagination";
import { JobDescription } from "@/hrm/jobs/models/Job";
import { JobQueryFilter } from "@/hrm/jobs/models/JobQuery";
import { getJobs } from "@/hrm/jobs/services/getJobs";

import JobCreateBtn from "./JobCreateBtn";
import JobSearch from "./JobSearch";
import JobTable from "./JobTable";

function getFilters(searchTerm: string) {
	const filters: Partial<JobQueryFilter> = {};

	const normalizedSearchTerm = searchTerm
		.replace(/^\s+/, "")
		.replace(/\s\s+/g, " ");

	if (normalizedSearchTerm) {
		filters.$or = [
			{
				code: {
					$regex: normalizedSearchTerm,
					$options: "i",
				},
			},
			{
				name: {
					$regex: normalizedSearchTerm,
					$options: "i",
				},
			},
			{
				"metadata.goodsInspectionField": {
					$regex: normalizedSearchTerm,
					$options: "i",
				},
			},
		];
	}

	return filters;
}

export default function JobList() {
	const [searchTerm, setSearchTerm] = useState<string>("");

	const handleLoadJobs = useCallback(
		async (
			page: number,
			pageSize: number,
		): Promise<[JobDescription[], number]> => {
			const jobs = await getJobs({
				filters: getFilters(searchTerm),
				sort: { code: "asc" },
				pagination: { page, pageSize },
			});

			return [jobs.items, jobs.total];
		},
		[searchTerm],
	);

	const {
		error,
		isLoading,
		items: jobs,
		offset,
		page,
		refetch,
		Pagination,
	} = usePagination<JobDescription>(handleLoadJobs);

	const handleSearch = useCallback((searchTerm: string) => {
		setSearchTerm(searchTerm);
	}, []);

	const handleJobDelete = useCallback(() => {
		refetch(jobs.length === 1 ? page - 1 : page);
	}, [jobs.length, page, refetch]);

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<div className="flex items-center gap-x-4">
					<div className="text-base">لیست سمت های شغلی</div>
					<JobCreateBtn />
				</div>

				<JobSearch searchTerm={searchTerm} onSearch={handleSearch} />
			</div>

			<JobTable
				error={error}
				jobs={jobs}
				loading={isLoading}
				offset={offset}
				onDelete={handleJobDelete}
			/>

			<Pagination />
		</div>
	);
}
