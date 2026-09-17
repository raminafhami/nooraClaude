"use client";

import { useCallback, useMemo, useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { BuyerType } from "@/buyers/enums/BuyerType";
import { Buyer } from "@/buyers/models/Buyer";
import { BuyerQueryFilter } from "@/buyers/models/BuyerQuery";
import { getBuyers } from "@/buyers/services/getBuyers";
import { searchBuyerName } from "@/buyers/utils/searchBuyerName";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Head } from "@/ui/Head";

import { BuyersActionCreate } from "./BuyersActionCreate";
import { BuyersFilter } from "./BuyersFilter";
import { BuyersTable } from "./BuyersTable";

function BuyersPage() {
	const { identity, isAuthorized } = useLoggedInUser();

	const canSee = useMemo<boolean>(
		() =>
			!!identity.branchId ||
			isAuthorized({
				groups: ["ceo", "buyers-manage", "buyers-view"],
			}),
		[identity.branchId, isAuthorized],
	);

	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
		type: BuyerType | null;
	}>({
		searchTerm: "",
		type: null,
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			if (!canSee) {
				return [[], 0] as [Buyer[], number];
			}

			const filters: BuyerQueryFilter = {};

			if (identity.branchId) {
				filters.branches = identity.branchId;
			}

			if (queryFilters.searchTerm) {
				filters.$or = [
					searchBuyerName(queryFilters.searchTerm),
					{ nationalCode: { $regex: queryFilters.searchTerm } },
					{ contactNo: { $regex: queryFilters.searchTerm } },
				];
			}

			if (queryFilters.type) {
				filters.type = queryFilters.type;
			}

			const buyers = await getBuyers({
				filters,
				pagination: { page, pageSize },
			});

			return [buyers.items, buyers.total] as const;
		},
		[identity.branchId, queryFilters.searchTerm, queryFilters.type, canSee],
	);

	const { items, isLoading, offset, page, refetch, Pagination } =
		usePagination<Buyer>(queryFn);

	const handleChange = useCallback(
		(clear: boolean = true) => {
			refetch(clear ? undefined : page);
		},
		[page, refetch],
	);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>لیست خریدارها</Head.Title>
				<Head.Nav className="sm:ms-auto">
					<BuyersActionCreate onChange={handleChange} />
				</Head.Nav>
			</Head.Root>

			{canSee ? (
				<>
					<Card>
						<CardContent className="space-y-6 px-0 pt-6">
							<BuyersFilter
								queryFilters={queryFilters}
								setQueryFilters={setQueryFilters}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="space-y-6 px-0 pt-6">
							<BuyersTable
								buyers={items}
								loading={isLoading}
								offset={offset}
								pagination={<Pagination />}
							/>
						</CardContent>
					</Card>
				</>
			) : (
				<Alert variant="info">
					<FaCircleExclamation />
					<AlertDescription>
						دسترسی شما به صفحه خریداران محدود شده است.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}

export { BuyersPage };
