"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Process, ProcessQueryFilter } from "@/felo/processes/models";
import { getProcesses } from "@/felo/processes/services/getProcesses";
import { groupDefinitions } from "@/felo/processes/utils/groupDefinitions";
import { Head } from "@/ui/Head";
import { getObjectEntries } from "@/utils/object/getObjectEntries";

import { ProcessesFilter } from "./ProcessesFilter";
import { ProcessesTable } from "./ProcessesTable";

type Item = Process & { category: string };

export const ProcessesPage = () => {
	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
	}>({
		searchTerm: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [items, setItems] = useState<Item[]>([]);

	const fetchProcess = useCallback(async () => {
		try {
			setIsLoading(true);

			let filters: Partial<ProcessQueryFilter> = {};

			if (queryFilters.searchTerm.trim()) {
				filters.name = {
					$regex: queryFilters.searchTerm.trim(),
					$options: "i",
				};
			}

			const response = await getProcesses({
				filters,
				sort: { key: "asc" },
			});

			const uniqueProcessesMap = new Map();
			response.forEach((process) => {
				uniqueProcessesMap.set(process.key, process);
			});

			const uniqueProcessesArr = Array.from(uniqueProcessesMap.values());
			const groupedProcesses = groupDefinitions(uniqueProcessesArr);

			const categorizedProcesses: Process[] = getObjectEntries(
				groupedProcesses,
			).flatMap(([category, processes]) =>
				processes.map((process) => ({ ...process, category })),
			);
			setItems(categorizedProcesses as Item[]);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [queryFilters.searchTerm]);

	useEffect(() => {
		fetchProcess();
	}, [fetchProcess, queryFilters.searchTerm]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>لیست فرایندها</Head.Title>
			</Head.Root>
			<Card>
				<CardContent className="pt-6">
					<ProcessesFilter
						queryFilters={queryFilters}
						setQueryFilters={setQueryFilters}
					/>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="px-0 pt-6">
					<ProcessesTable items={items} loading={isLoading} />
				</CardContent>
			</Card>
		</div>
	);
};
