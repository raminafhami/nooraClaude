"use client";

import moment from "jalali-moment";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FaTriangleExclamation, FaUserPlus } from "react-icons/fa6";
import { useDebounce } from "use-debounce";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Input } from "@/components/ui/input";
import { Numeric } from "@/components/ui/numeric";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import PettyCategoryUpsertDialog from "@/financial/petty-category/components/PettyCategoryUpsertDialog";
import { getPettyCategories } from "@/financial/petty-category/services/getPettyCategoriesWithBudget";
import { cn } from "@/lib/utils";
import { toCurrency } from "@/utils/String";

import { PettyCategoryAndBudget } from "../models/PettyCategoryAndBudget";
import { PettyCategoryAndBudgetQueryFilter } from "../models/PettyCategoryAndBudgetQuery";

const LIST_PAGE_SIZE = 12;

const BudgetCategoryList = () => {
	const router = useRouter();

	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const filters: PettyCategoryAndBudgetQueryFilter = {
				isDeleted: false,
			};

			if (debouncedSearchTerm) {
				filters.$or = [
					{
						title: { $regex: debouncedSearchTerm, $options: "i" },
					},
					{
						code: { $regex: debouncedSearchTerm },
					},
				];
			}

			const categories = await getPettyCategories({
				filters,
				pagination: { page, pageSize },
			});

			return [categories.items, categories.total] as const;
		},
		[debouncedSearchTerm],
	);

	const { items, refetch, Pagination, isLoading } =
		usePagination<PettyCategoryAndBudget>(fetchData, undefined, LIST_PAGE_SIZE);

	// create dialog
	const dialog = useDialogs();

	const handleAddBudgetDialogOpen = useCallback(async () => {
		const result = await dialog.open(PettyCategoryUpsertDialog);
		if (result) {
			refetch();
		}
	}, [dialog, refetch]);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>لیست مراکز بودجه</CardTitle>
				<CardNav>
					<Input
						placeholder="جستجو"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>

					<Button onClick={handleAddBudgetDialogOpen} variant="primary">
						<FaUserPlus />
						<span>افزودن مرکز بودجه</span>
					</Button>
				</CardNav>
			</CardHeader>

			<CardContent className="space-y-8">
				{isLoading && <Spinner label="در حال دریافت اطلاعات..." size="sm" />}

				{!isLoading && (
					<>
						<div className="grid w-full grid-cols-12 gap-6">
							{items.length ? (
								items.map((item) => {
									const usedAmount = item.amount
										? item.amount - item.remain
										: 0;
									const usedPercentage = usedAmount
										? (usedAmount / item.amount) * 100
										: 0;

									return (
										<Card
											key={item.id}
											className={cn(
												"col-span-full min-h-64 cursor-pointer sm:col-span-6 lg:col-span-4 2xl:col-span-3",
												item.isDeleted && "opacity-40",
											)}
											onClick={() =>
												router.push(
													`/dashboard/financial/budget-category/${item.id}`,
												)
											}
										>
											<CardContent className="flex h-full flex-col gap-6 pt-6">
												<div className="flex justify-between gap-6">
													<div className="truncate">{item.title}</div>

													<div className="flex shrink-0 items-center gap-2">
														<div>کد حسابداری:</div>
														<div>
															<Numeric value={item.code} />
														</div>
													</div>
												</div>

												<Separator className="h-0.5" />

												<div className="grow">
													{!!item.amount && (
														<div className="space-y-2">
															<div className="flex items-center justify-between gap-6">
																<div className="truncate">
																	بودجه {item.budgetName}
																</div>
																<div className="text-end">{`از ${moment(item.dateFrom).format("jYYYY/jMM/jDD")} تا ${moment(item.dateTo).format("jYYYY/jMM/jDD")}`}</div>
															</div>

															<Separator />

															<div className="flex items-center justify-between">
																<div className="text-muted-foreground">
																	مقدار کل بودجه
																</div>
																<div>
																	<Numeric
																		value={toCurrency(item.amount.toString())}
																	/>{" "}
																	ریال
																</div>
															</div>

															<Separator />

															<div className="flex items-center justify-between">
																<div
																	className={cn(
																		"flex items-center gap-1 text-muted-foreground",
																		usedPercentage >= 100 &&
																			"text-destructive/80",
																	)}
																>
																	{usedPercentage >= 100 && (
																		<FaTriangleExclamation />
																	)}
																	<span>مقدار استفاده شده</span>
																</div>
																<div
																	className={cn(
																		usedPercentage >= 100 && "text-destructive",
																	)}
																>
																	(
																	<Numeric value={usedPercentage.toFixed(0)} />
																	%){" "}
																	<Numeric
																		value={toCurrency(usedAmount.toString())}
																	/>{" "}
																	ریال
																</div>
															</div>

															<Separator />

															<Progress
																className="!mt-4 h-2.5 w-full"
																color={
																	usedPercentage >= 100 ? "red" : "default"
																}
																value={Math.min(
																	Math.floor(usedPercentage),
																	100,
																)}
															/>
														</div>
													)}

													{!item.amount && (
														<div className="flex size-full items-center justify-center rounded-2xl bg-gray-100 text-muted-foreground">
															فاقد بودجه
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									);
								})
							) : (
								<div className="col-span-full">هیچ موردی یافت نشد.</div>
							)}
						</div>

						<Pagination setSize={null} size={LIST_PAGE_SIZE} />
					</>
				)}
			</CardContent>
		</Card>
	);
};

export { BudgetCategoryList };
