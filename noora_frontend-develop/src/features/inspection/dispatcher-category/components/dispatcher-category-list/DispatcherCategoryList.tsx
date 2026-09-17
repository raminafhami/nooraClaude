"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";

import { useTableStore } from "@/cache/store/tableStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardNav, CardTitle } from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { usePagination } from "@/components/ui/pagination/usePagination";

import { DispatcherCategory } from "../../models/DispatcherCategory";
import { DispatcherCategoryQueryFilter } from "../../models/DispatcherCategoryQuery";
import { getCompanyDispatcherCategoryDomainCodes } from "../../services/getCompanyDispatcherCategoryDomainCodes";
import { getDispatcherCategories } from "../../services/getDispatcherCategories";
import { DispatcherCategoryFilterBar } from "./DispatcherCategoryFilterBar";
import { DispatcherCategoryFilterArgs } from "./DispatcherCategoryList.types";
import { DispatcherCategoryTable } from "./DispatcherCategoryTable";

const DispatcherCategoryFilterDialog = dynamic(
	() => import("./DispatcherCategoryFilterDialog"),
);

const DispatcherCategoryUpsertDialog = dynamic(
	() => import("../dispatcher-category-upsert/DispatcherCategoryUpsertDialog"),
);

const DispatcherCategoryDeleteDialog = dynamic(
	() => import("../dispatcher-category-delete/DispatcherCategoryDeleteDialog"),
);

const LIST_CACHE_KEY = "DispatcherCategoryList";

function DispatcherCategoryList() {
	const dialogs = useDialogs();

	const { setTableData, getTableData } = useTableStore();
	const cachedData = getTableData(LIST_CACHE_KEY);

	const [companyDomainCodes, setCompanyDomainCodes] = useState<string[]>();

	const [filterArgs, setFilterArgs] = useState<DispatcherCategoryFilterArgs>(
		cachedData?.filters ?? {},
	);

	const dispatcherCategoryQueryFn = useCallback(
		async (page: number, pageSize: number) => {
			const filters: DispatcherCategoryQueryFilter = {};

			if (filterArgs.type) {
				filters.type = filterArgs.type;
			}

			if (filterArgs.domainCode) {
				filters.domainCode = { $regex: filterArgs.domainCode, $options: "i" };
			}

			if (filterArgs.inspectionDomain) {
				filters.inspectionDomain = {
					$regex: filterArgs.inspectionDomain,
					$options: "i",
				};
			}

			let companyDomainCodes: string[] | undefined;
			if (filterArgs.company) {
				companyDomainCodes = await getCompanyDispatcherCategoryDomainCodes();

				if (!companyDomainCodes.length) {
					setCompanyDomainCodes([]);
					return [[], 0] as [DispatcherCategory[], number];
				}

				filters.domainCode = companyDomainCodes;
			}

			const categories = await getDispatcherCategories({
				filters,
				pagination: { page, pageSize },
				sort: { type: "asc", domainCode: "asc" },
			});

			setCompanyDomainCodes(companyDomainCodes);
			return [categories.items, categories.total] as const;
		},
		[filterArgs],
	);

	const {
		error,
		isLoading,
		items,
		offset,
		page,
		pageSize,
		refetch: refetchDispatcherCategories,
		Pagination,
	} = usePagination<DispatcherCategory>(
		dispatcherCategoryQueryFn,
		cachedData?.page,
		cachedData?.size,
	);

	useEffect(() => {
		setTableData({
			tableName: LIST_CACHE_KEY,
			page: page,
			size: pageSize,
			data: items,
			filters: filterArgs,
		});
	}, [items, page, pageSize, filterArgs, setTableData]);

	const disabled = isLoading;

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست گروه های کالایی</CardTitle>
				<CardNav>
					<Button
						disabled={disabled}
						type="button"
						onClick={async () => {
							const result = await dialogs.open(
								DispatcherCategoryFilterDialog,
								filterArgs,
							);

							if (result) {
								setFilterArgs(result);
							}
						}}
					>
						<FaMagnifyingGlass />
						<span>جستجو</span>
					</Button>

					<Button
						disabled={disabled}
						type="button"
						variant="primary"
						onClick={async () => {
							const result = await dialogs.open(
								DispatcherCategoryUpsertDialog,
								{},
							);

							if (result) {
								refetchDispatcherCategories();
							}
						}}
					>
						<FaPlus />
						<span>ایجاد گروه کالایی جدید</span>
					</Button>
				</CardNav>
			</CardHeader>

			<DispatcherCategoryFilterBar
				disabled={disabled}
				filterArgs={filterArgs}
				onFilterArgsUpdate={setFilterArgs}
			/>

			<DispatcherCategoryTable
				items={items}
				companyDomainCodes={companyDomainCodes}
				loading={isLoading}
				error={error}
				offset={offset}
				pagination={<Pagination />}
				onChange={refetchDispatcherCategories}
				onItemEdit={async (category) => {
					const result = await dialogs.open(DispatcherCategoryUpsertDialog, {
						category,
					});

					if (result) {
						refetchDispatcherCategories();
					}
				}}
				onItemDelete={async (category) => {
					const result = await dialogs.open(DispatcherCategoryDeleteDialog, {
						category,
					});

					if (result) {
						refetchDispatcherCategories();
					}
				}}
			/>
		</Card>
	);
}

export { DispatcherCategoryList };
