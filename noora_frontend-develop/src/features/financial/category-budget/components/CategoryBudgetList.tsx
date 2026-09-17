"use client";

import moment from "jalali-moment";
import { useCallback, useState } from "react";
import {
	FaBan,
	FaEllipsis,
	FaPenToSquare,
	FaPlus,
	FaThumbsUp,
} from "react-icons/fa6";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Spinner } from "@/components/ui/spinner";
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
import { CategoryBudget } from "@/financial/category-budget/models/CategoryBudget";
import { getCategoryBudget } from "@/financial/category-budget/services/getBudgetCategory";
import { patchCategoryBudgetStatus } from "@/financial/category-budget/services/patchCategoryBudgetStatus";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { handlePettyError } from "@/financial/petty/utils/handlePettyError";
import { cn } from "@/lib/utils";
import { toCurrency } from "@/utils/String";

import { CategoryBudgetAddDialog } from "./CategoryBudgetAddDialog";
import { CategoryBudgetEditDialog } from "./CategoryBudgetEditDialog";

const CategoryBudgetList = ({
	budgetCategory,
}: {
	budgetCategory: FinancialCategory;
}) => {
	const dialog = useDialogs();

	// data
	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const budgets = await getCategoryBudget({
				filters: { categoryId: budgetCategory.id },
				pagination: { page, pageSize },
			});

			return [budgets.items, budgets.total] as const;
		},
		[budgetCategory.id],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	// dialogs
	const handleAddBudgetDialogOpen = useCallback(async () => {
		const result = await dialog.open(CategoryBudgetAddDialog, {
			categoryId: budgetCategory.id,
		});

		if (result) {
			refetch();
		}
	}, [dialog, budgetCategory.id, refetch]);

	const handleEditBudgetDialogOpen = useCallback(
		async (budget: CategoryBudget) => {
			const result = await dialog.open(CategoryBudgetEditDialog, budget);

			if (result) {
				refetch();
			}
		},
		[dialog, refetch],
	);

	// actions
	const [inUpdate, setInUpdate] = useState<string>();

	const handleBudgetStatusChange = useCallback(
		async (budget: CategoryBudget) => {
			try {
				setInUpdate(budget.id);

				await patchCategoryBudgetStatus(budget.id, {
					active: !budget.isActive,
				});

				refetch();
			} catch (err: any) {
				const errorMessage =
					handlePettyError(err.message) ||
					"خطای نامشخصی در هنگام بروزرسانی وضعیت تنخواه رخ داد.";

				toast.error(errorMessage);
				console.error(err);
			} finally {
				setInUpdate(undefined);
			}
		},
		[refetch],
	);

	const isPending = !!inUpdate;

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست ردیف های بودجه</CardTitle>
				{!budgetCategory.isDeleted && (
					<CardNav>
						<Button
							disabled={isPending}
							type="button"
							variant="primary"
							onClick={handleAddBudgetDialogOpen}
						>
							<FaPlus />
							<span>افزودن ردیف بودجه</span>
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
							<TableHead className="w-40">کل بودجه (ریال)</TableHead>
							<TableHead className="w-40">باقی مانده (ریال)</TableHead>
							<TableHead className="w-36">تاریخ ایجاد</TableHead>
							<TableHead className="w-36">تاریخ فعال</TableHead>
							<TableHead className="w-32">وضعیت</TableHead>
							{!budgetCategory.isDeleted && (
								<TableHead className="w-32">عملیات</TableHead>
							)}
						</TableRow>
					</TableHeader>

					<TableBody>
						{items?.length ? (
							items.map((item, index) => (
								<TableRow key={item.id} className="whitespace-nowrap">
									<TableCell>{offset + index + 1}</TableCell>

									<TableCell>{item.name}</TableCell>

									<TableCell>{toCurrency(String(item.amount))} ریال</TableCell>

									<TableCell
										className={cn(item.remain < 0 && "text-destructive")}
									>
										<span dir="ltr">{toCurrency(String(item.remain))}</span>{" "}
										ریال
									</TableCell>

									<TableCell>
										{moment(item.dateFrom).format("jYYYY/jMM/jDD")}
									</TableCell>

									<TableCell>
										{moment(item.dateTo).format("jYYYY/jMM/jDD")}
									</TableCell>

									<TableCell>
										{item.isActive ? (
											<Badge className="bg-blue-100 text-blue-900">فعال</Badge>
										) : (
											<Badge className="bg-red-100 text-red-900">
												غیر فعال
											</Badge>
										)}
									</TableCell>

									{!budgetCategory.isDeleted && (
										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	disabled={isPending}
																	size="icon"
																	type="button"
																	variant="ghost"
																	onClick={() => {
																		handleEditBudgetDialogOpen(item);
																	}}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش بودجه</TooltipContent>
														</TableAction>
													</Tooltip>

													<TableAction>
														<DropdownMenu>
															<DropdownMenuTrigger className="h-full">
																<FaEllipsis />
															</DropdownMenuTrigger>
															<DropdownMenuContent className="min-w-48">
																<DropdownMenuItem
																	className="flex items-center gap-2"
																	disabled={isPending}
																	onSelect={(event) => {
																		event.preventDefault();
																		handleBudgetStatusChange(item);
																	}}
																>
																	<div className="flex grow items-center gap-2">
																		<Spinner
																			loading={inUpdate === item.id}
																			size="xs"
																		>
																			{item.isActive ? (
																				<FaBan />
																			) : (
																				<FaThumbsUp />
																			)}
																		</Spinner>
																		<span>
																			{item.isActive
																				? "غیر فعال کردن"
																				: "فعال کردن"}{" "}
																			ردیف بودجه
																		</span>
																	</div>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableAction>
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

export { CategoryBudgetList };
