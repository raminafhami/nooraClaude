"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaEye } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useTableStore } from "@/cache/store/tableStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Numeric } from "@/components/ui/numeric";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContractNumberQueryFilter } from "@/contract-number/models/ContractNumberQuery";
import { getContractNumbers } from "@/contract-number/services/getContractNumbers";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { ContractFilter } from "./ContractFilter";

const LIST_CACHE_KEY = "InspectionContractList";

const ContractList = () => {
	const router = useRouter();

	const { identity } = useLoggedInUser();

	const { setTableData, getTableData } = useTableStore();
	const cachedData = getTableData(LIST_CACHE_KEY);

	const [filterArgs, setFilterArgs] = useState<ContractNumberQueryFilter>(
		cachedData?.filters ?? {},
	);

	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			let filters: ContractNumberQueryFilter = {};

			if (filterArgs.cn) {
				filters.cn = filterArgs.cn;
			}

			if (filterArgs.title) {
				filters.title = filterArgs.title;
			}

			if (filterArgs.proforma) {
				filters.proforma = filterArgs.proforma;
			}

			if (filterArgs.buyer) {
				filters.buyerId = filterArgs.buyer.id;
			}

			if (filterArgs.customer) {
				filters.customerId = filterArgs.customer.id;
			}

			if (identity.branchId) {
				filters.branchId = identity.branchId;
			} else if (filterArgs.branchId) {
				filters.branchId = filterArgs.branchId;
			}

			const contracts = await getContractNumbers({
				filters,
				pagination: { page, pageSize },
				populate: ["buyerId", "customerId", "branchId"],
				sort: { createdAt: "desc" },
			});

			return [contracts.items, contracts.total] as const;
		},
		[filterArgs, identity.branchId],
	);

	const { items, isLoading, offset, page, pageSize, Pagination } =
		usePagination(fetchData, cachedData?.page, cachedData?.size);

	useEffect(() => {
		setTableData({
			tableName: LIST_CACHE_KEY,
			page: page,
			size: pageSize,
			filters: filterArgs,
		});
	}, [items, page, pageSize, filterArgs, setTableData]);

	return (
		<>
			<Card>
				<CardContent className="px-0 pt-6">
					<ContractFilter
						filterArgs={filterArgs}
						onFilterArgsUpdate={setFilterArgs}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>فهرست قراردادها</CardTitle>
				</CardHeader>

				<CardContent className="px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination />}
						slotProps={{
							root: { className: "rounded-none border-x-0" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">#</TableHead>
								<TableHead>عنوان</TableHead>
								<TableHead className="w-48">شماره قرارداد</TableHead>
								<TableHead className="w-64">خریدار</TableHead>
								<TableHead className="w-64">مشتری</TableHead>
								<TableHead className="w-48">شماره پروفرما</TableHead>
								<TableHead className="w-36">شعبه</TableHead>
								<TableHead className="w-28">عملیات</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{items.map((contract, index) => (
								<TableRow key={contract.id} className="whitespace-nowrap">
									<TableCell>
										<Numeric value={offset + index + 1} />
									</TableCell>

									<TableCell
										className="cursor-pointer"
										onClick={() => {
											router.push(
												`/dashboard/inspection/contract/${contract.id}`,
											);
										}}
									>
										{contract.title}
									</TableCell>

									<TableCell
										className="cursor-pointer"
										onClick={() => {
											router.push(
												`/dashboard/inspection/contract/${contract.id}`,
											);
										}}
									>
										{contract.cn}
									</TableCell>

									<TableCell>
										{asNavigationProp(contract.buyerId).name}
									</TableCell>

									<TableCell>
										{getUserFullname(asNavigationProp(contract.customerId)) ||
											"-"}
									</TableCell>

									<TableCell>
										<Numeric value={contract.proforma ?? "-"} />
									</TableCell>

									<TableCell>
										{asNavigationProp(contract.branchId)?.title}
									</TableCell>

									<TableCell>
										<TooltipProvider>
											<TableActions>
												<Tooltip>
													<TableAction>
														<TooltipTrigger asChild>
															<Button
																className="size-full"
																size="icon"
																type="button"
																variant="link"
																onClick={() => {
																	router.push(
																		`/dashboard/inspection/contract/${contract.id}`,
																	);
																}}
															>
																<FaEye />
															</Button>
														</TooltipTrigger>
														<TooltipContent>مشاهده قرارداد</TooltipContent>
													</TableAction>
												</Tooltip>
											</TableActions>
										</TooltipProvider>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</>
	);
};

export default ContractList;
