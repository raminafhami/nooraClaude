"use client";

import moment from "jalali-moment";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { Contract } from "@/hrm/contract/models/Contract";
import { ContractQueryFilter } from "@/hrm/contract/models/ContractQuery";
import { getContracts } from "@/hrm/contract/services/getContracts";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { Head } from "@/ui/Head";

import { ContractsFilter } from "./ContractsFilter";
import { ContractsTable } from "./ContractsTable";

function ContractsPage() {
	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
		user: UserLookup | null;
		status: ContractStatus | null;
		dateFrom: string;
		dateTo: string;
	}>({
		searchTerm: "",
		user: null,
		status: null,
		dateFrom: "",
		dateTo: "",
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const filters: ContractQueryFilter = {};

			const $andFilter: ContractQueryFilter[] = [];

			const searchTerm = queryFilters.searchTerm.trim();
			if (searchTerm) {
				$andFilter.push({
					$or: [
						{
							contractNo: {
								$regex: searchTerm,
								$options: "i",
							},
						},
						{
							workplace: {
								$regex: searchTerm,
								$options: "i",
							},
						},
					],
				});
			}

			if (queryFilters.user) {
				filters["user.id"] = queryFilters.user.id;
			}

			if (queryFilters.status) {
				filters.status = queryFilters.status;
			}

			const dateFrom = queryFilters.dateFrom.trim();
			if (dateFrom) {
				$andFilter.push({
					$or: [
						{
							endDate: {
								$gte: moment(dateFrom, "jYYYY/jMM/jDD").toISOString(),
							},
						},
					],
				});
			}

			const dateTo = queryFilters.dateTo.trim();
			if (dateTo) {
				$andFilter.push({
					$or: [
						{
							startDate: {
								$lte: moment(dateTo, "jYYYY/jMM/jDD").toISOString(),
							},
						},
					],
				});
			}

			if ($andFilter.length) {
				filters.$and = $andFilter;
			}

			const { items, total } = await getContracts({
				filters,
				sort: { signDate: -1 },
				pagination: { page, pageSize },
			});

			return [items, total] as const;
		},
		[queryFilters],
	);

	const { items, isLoading, error, offset, Pagination } =
		usePagination<Contract>(queryFn);

	return (
		<>
			<div className="space-y-8">
				<Head.Root>
					<Head.Title>لیست قراردادها</Head.Title>
					<Head.Nav className="sm:ms-auto">
						<DynamicLink href="/dashboard/hr-management/contract/add">
							<Button variant="primary">
								<FaPlus />
								<span>ایجاد قرارداد جدید</span>
							</Button>
						</DynamicLink>
					</Head.Nav>
				</Head.Root>

				<Card>
					<CardContent className="px-0 pt-6">
						<ContractsFilter
							queryFilters={queryFilters}
							setQueryFilters={setQueryFilters}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="px-0 pt-6">
						<ContractsTable
							items={items}
							loading={isLoading}
							error={error}
							offset={offset}
							pagination={<Pagination />}
						/>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export { ContractsPage };
