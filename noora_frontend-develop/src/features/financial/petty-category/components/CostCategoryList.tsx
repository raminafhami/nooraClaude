"use client";

import React, { useCallback } from "react";
import { FaPenToSquare, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
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
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { FinancialCategoryQueryFilter } from "@/financial/financial-category/models/FinancialCategoryQuery";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import PettyCategoryUpsertDialog from "@/financial/petty-category/components/PettyCategoryUpsertDialog";

import { deleteCategory } from "../services/deleteCategory";

const CostCategoryList = ({
	budgetCategory,
}: {
	budgetCategory: FinancialCategory;
}) => {
	const dialog = useDialogs();

	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const filters: FinancialCategoryQueryFilter = {
				parentId: budgetCategory.id,
				type: "petty",
			};

			if (!budgetCategory.isDeleted) {
				filters.isDeleted = false;
			}

			const categories = await getFinancialCategories({
				filters,
				pagination: { page, pageSize },
				sort: { code: "asc" },
			});

			return [categories.items, categories.total] as const;
		},
		[budgetCategory.id, budgetCategory.isDeleted],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	// dialogs
	const handleCostCenterUpsertDialogOpen = useCallback(
		async (category?: FinancialCategory) => {
			const result = await dialog.open(
				PettyCategoryUpsertDialog,
				category ?? { parentId: budgetCategory.id },
			);

			if (result) {
				refetch();
			}
		},
		[dialog, budgetCategory.id, refetch],
	);

	const handleCostCategoryDeleteDialog = useCallback(
		async (item: FinancialCategory) => {
			const result = await dialog.open(DeleteDialog, {
				title: `مرکز هزینه ${item.title}`,
				onSubmit: async () => {
					await deleteCategory(item.id);
					toast.success("مرکز هزینه با موفقیت حذف شد.");
				},
				onError: () => {
					toast.error("خطای نامشخصی در حذف مرکز هزینه رخ داد.");
				},
			});

			if (result) {
				refetch();
			}
		},
		[dialog, refetch],
	);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست مراکز هزینه</CardTitle>
				{!budgetCategory.isDeleted && (
					<CardNav>
						<Button
							type="button"
							variant="primary"
							onClick={handleCostCenterUpsertDialogOpen.bind(null, undefined)}
						>
							<FaPlus />
							<span>افزودن مرکز هزینه</span>
						</Button>
					</CardNav>
				)}
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
							<TableHead className="w-16">#</TableHead>
							<TableHead>عنوان</TableHead>
							<TableHead className="w-36">کد حسابداری</TableHead>
							{!budgetCategory.isDeleted && (
								<TableHead className="w-28">عملیات</TableHead>
							)}
						</TableRow>
					</TableHeader>

					<TableBody>
						{items?.length ? (
							items.map((item, index) => (
								<TableRow key={item.id} className="whitespace-nowrap">
									<TableCell>{offset + index + 1}</TableCell>

									<TableCell>{item.title}</TableCell>

									<TableCell>{item.code}</TableCell>

									{!budgetCategory.isDeleted && (
										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	size="icon"
																	variant="ghost"
																	onClick={() => {
																		handleCostCenterUpsertDialogOpen(item);
																	}}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش</TooltipContent>
														</TableAction>
													</Tooltip>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	size="icon"
																	variant="ghost"
																	onClick={() => {
																		handleCostCategoryDeleteDialog(item);
																	}}
																>
																	<FaTrash />
																</Button>
															</TooltipTrigger>
															<TooltipContent>حذف</TooltipContent>
														</TableAction>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									)}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export { CostCategoryList };
