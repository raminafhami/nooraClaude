"use client";

import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { EntityQueryFilter } from "@/api/models/EntityQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { ExpertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { ExpertiseQueryFilterParam } from "@/hrm/expertises/models/ExpertiseQuery";
import { getExpertises } from "@/hrm/expertises/services/getExpertises";
import { searchExpertiseTitle } from "@/hrm/expertises/utils/searchExpertiseTitle";
import { Head } from "@/ui/Head";

import { ExpertisesFilter } from "./ExpertisesFilter";
import { ExpertisesTable } from "./ExpertisesTable";
import { ExpertiseUpsertDialog } from "./ExpertiseUpsertDialog";

function ExpertisesList() {
	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
		type: ExpertiseType | null;
	}>({
		searchTerm: "",
		type: null,
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			let filters: Partial<EntityQueryFilter<ExpertiseQueryFilterParam>> = {};

			if (queryFilters.searchTerm) {
				filters = {
					...filters,
					...searchExpertiseTitle(queryFilters.searchTerm),
				};
			}

			if (queryFilters.type) {
				filters.type = queryFilters.type;
			}

			const expertises = await getExpertises({
				filters,
				pagination: { page, pageSize },
			});

			return [expertises.items, expertises.total] as const;
		},
		[queryFilters],
	);

	const { items, isLoading, offset, refetch, Pagination } =
		usePagination(queryFn);

	const [upsertDialogOpen, setUpsertDialogOpen] = useState<boolean>(false);
	const [upsertDialogPayload, setUpsertDialogPayload] = useState<Expertise>();

	const handleUpsertDialogOpen = useCallback((payload?: Expertise) => {
		setUpsertDialogOpen(true);
		setUpsertDialogPayload(payload);
	}, []);

	const handleUpsertDialogClose = useCallback(
		(result?: Expertise) => {
			setUpsertDialogOpen(false);
			if (result) refetch();
		},
		[refetch],
	);

	const handleExpertiseChange = useCallback(() => {
		refetch();
	}, [refetch]);

	return (
		<>
			<div className="space-y-8">
				<Head.Root>
					<Head.Title>لیست توانمندی ها</Head.Title>
					<Head.Nav className="ms-auto">
						<Button variant="primary" onClick={() => handleUpsertDialogOpen()}>
							<FaPlus />
							افزودن توانمندی جدید
						</Button>
					</Head.Nav>
				</Head.Root>

				<Card>
					<CardContent className="px-0 pt-6">
						<ExpertisesFilter
							queryFilters={queryFilters}
							setQueryFilters={setQueryFilters}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="px-0 pt-6">
						<ExpertisesTable
							items={items}
							loading={isLoading}
							offset={offset}
							pagination={<Pagination />}
							onChange={handleExpertiseChange}
							onEdit={handleUpsertDialogOpen}
						/>
					</CardContent>
				</Card>
			</div>

			<ExpertiseUpsertDialog
				payload={upsertDialogPayload}
				open={upsertDialogOpen}
				onClose={handleUpsertDialogClose}
			/>
		</>
	);
}

export { ExpertisesList };
