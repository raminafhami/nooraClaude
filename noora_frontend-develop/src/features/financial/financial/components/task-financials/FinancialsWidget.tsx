"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCaretDown,
  FaCaretUp,
  FaPenToSquare,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardNav,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Currency, currency } from "@/enums/Currency";
import { TaskStatus } from "@/felo/tasks/enums/TaskStatus";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { CostMethod } from "@/financial/costs/enums/CostMethod";
import {
  costService,
  CostService,
  CostServiceConfig,
} from "@/financial/costs/enums/CostService";
import { CostServiceAccessType } from "@/financial/costs/enums/CostServiceAccessType";
import { CostStatus } from "@/financial/costs/enums/CostStatus";
import { CostType } from "@/financial/costs/enums/CostType";
import { Cost } from "@/financial/costs/models/Cost";
import {
  createCost,
  CreateCostModel,
} from "@/financial/costs/services/createCost";
import { deleteCost } from "@/financial/costs/services/deleteCost";
import { getCostsByCase } from "@/financial/costs/services/getCostsByCase";
import { updateCostsTotalsByCase } from "@/financial/costs/services/updateCostTotalsByCase";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { getRecommendedPaymentRules } from "@/financial/payment-rules/services/getRecommendedPaymentRules";
import { UserType } from "@/identity/users/models/UserType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { getColorForPercentage } from "@/utils/getColorByPercentage";
import { toCurrency } from "@/utils/String";

import { CostItemPaymentAmount } from "../../../costs/components/CostItemPaymentAmount";
import { CostStatusBadge } from "../../../costs/components/CostStatusBadge";
import { IncomeStatusBadge } from "../../../incomes/components/IncomeStatusBadge";
import { FinancialType } from "../../enums/FinancialType";
import {
  Financial,
  FinancialCost,
  FinancialIncome,
} from "../../models/Financial";
import { FinancialUpsertDialog } from "../financial-upsert/FinancialUpsertDialog";

function FinancialsWidget({
	defaultCosts,
}: {
	defaultCosts: CreateCostModel[];
}) {
	const { task } = useTaskContext();

	const canAct = task.status === TaskStatus.Todo;

	const [isPending, setIsPending] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [financials, setFinancials] = useState<Financial[]>();

	const queryFn = useCallback(async () => {
		if (isPending) {
			return;
		}

		try {
			setIsLoading(true);
			setErrorMessage(undefined);

			const [incomes, costs] = await Promise.all([
				getIncomes({
					filters: { instanceId: task.instanceId, isDeleted: false },
				}),
				getCostsByCase(task.instanceId),
			]);

			const nextFinancials: Financial[] = [];
			nextFinancials.push(
				...incomes.map(
					(x) => ({ type: FinancialType.Income, item: x }) as Financial,
				),
			);
			nextFinancials.push(
				...costs.map(
					(x) => ({ type: FinancialType.Cost, item: x }) as Financial,
				),
			);

			setFinancials(nextFinancials);
		} catch (err: any) {
			console.error(err);
			setErrorMessage(
				err.message ?? "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
			);
		} finally {
			setIsLoading(false);
		}
	}, [isPending, task.instanceId]);

	const [upsertDialogOpen, setUpsertDialogOpen] = useState<boolean>(false);
	const [upsertDialogPayload, setUpsertDialogPayload] = useState<
		Financial | Pick<Financial, "type">
	>();

	const handleUpsertDialogOpen = useCallback(
		(payload?: Financial | Pick<Financial, "type">) => {
			setUpsertDialogPayload(payload);
			setUpsertDialogOpen(true);
		},
		[],
	);

	const handleUpsertDialogClose = useCallback(
		(result?: boolean) => {
			setUpsertDialogOpen(false);
			if (result) queryFn();
		},
		[queryFn],
	);

	useEffect(() => {
		(async () => {
			try {
				setIsPending(true);

				const costs = await getCostsByCase(task.instanceId);

				const toCreateCosts: CreateCostModel[] = [];
				const toDeleteCosts: Cost[] = [];
				const safeCosts: Cost[] = [];

				const categories = await getFinancialCategories({
					filters: { type: FinancialCategoryType.Cost, key: { $exists: true } },
				});

				defaultCosts.forEach((cost) => {
					const costCategory = categories.find(
						(x) => x.key === cost.categoryKey,
					);

					if (!costCategory) {
						throw new Error("cost category is not found.");
					}

					const duplicateCost = costs.find(
						(x) => x.categoryId === costCategory.id,
					);

					if (!duplicateCost) {
						toCreateCosts.push(cost);
						return;
					}

					if (
						duplicateCost.personId &&
						duplicateCost.personId !== cost.personId
					) {
						toCreateCosts.push(cost);
						toDeleteCosts.push(duplicateCost);
						return;
					}

					safeCosts.push(duplicateCost);
				});

				if (toCreateCosts.length || toDeleteCosts.length) {
					if (toDeleteCosts.length) {
						await Promise.all(
							toDeleteCosts.map(async (cost) => {
								await deleteCost(cost.id);
							}),
						);
					}

					await Promise.all(
						toCreateCosts.map(async (cost) => {
							let rule: PaymentRule | undefined;

							if (cost.personId && !cost.amount) {
								const buyerId = task.data["Buyer"]?.id;
								const inspectionType = detectInspectionType(task.processKey);
								const caseType =
									task.data["CaseType"] ||
									task.data["InvoiceType"] ||
									"official";
								const inspectionMethod = task.data["InspectionMethod"];

								const rules = await getRecommendedPaymentRules(cost.personId, {
									service: cost.options?.service,
									buyerId,
									inspectionType,
									caseType,
									inspectionMethod,
									role: cost.options?.role,
								});

								if (
									rules.length &&
									(!cost.options?.autoselect ||
										cost.options?.autoselect === "best" ||
										(cost.options?.autoselect === "single" &&
											rules.length === 1))
								) {
									rule = rules[0];
								}
							}

							if (rule) {
								cost.ruleId = rule.id;
								cost.type = rule.type as unknown as CostType;
								cost.method = rule.method as unknown as CostMethod;
								cost.amount = rule.amount.toString();
							}

							const createdCost = await createCost(cost);
							return { ...createdCost, rule };
						}),
					);
				} else {
					await updateCostsTotalsByCase(task.instanceId);
				}
			} catch (err: any) {
				console.error(err);
				setErrorMessage(
					err.message || "خطای نامشخصی هنگام دریافت اطلاعات رخ داد.",
				);
			} finally {
				setIsPending(false);
			}
		})();
	}, [defaultCosts, task.data, task.instanceId, task.processKey]);

	useEffect(() => {
		queryFn();
	}, [queryFn]);

	const totalIncome = useMemo(
		() =>
			financials
				?.filter((x) => x.type === FinancialType.Income)
				.map((x) => x.item.total)
				.reduce((acc, val) => (acc += val), 0) ?? 0,
		[financials],
	);

	const totalRemaining = useMemo(
		() =>
			totalIncome -
			(financials
				?.filter((x) => x.type === FinancialType.Cost)
				.map((x) => (x.item.total ? Number(x.item.total) : 0))
				.reduce((acc, val) => (acc += val), 0) ?? 0),
		[financials, totalIncome],
	);

	return (
		<>
			<div className="col-span-full !col-start-1 space-y-3 xl:col-span-9 2xl:col-span-8">
				<Card>
					<CardHeader orientation="horizontal">
						<CardTitle>
							درآمدها و هزینه ها
							<div
								className="flex select-none items-center rounded-xl px-4 py-1 text-xsm"
								style={{
									backgroundColor: getColorForPercentage(
										totalRemaining / totalIncome,
										0.4,
									),
								}}
							>
								<span className="-mb-0.5 text-xs" dir="ltr">
									{toCurrency(totalRemaining.toString())}
								</span>
								&nbsp;ریال (
								<span className="-mb-0.5 text-xs" dir="ltr">
									{`%${((totalRemaining / totalIncome) * 100).toFixed(2)}`}
								</span>
								) باقی مانده از&nbsp;
								<span className="-mb-0.5 text-xs" dir="ltr">
									{toCurrency(totalIncome.toString())}
								</span>
								&nbsp;ریال
							</div>
						</CardTitle>
						{canAct && (
							<CardNav>
								<Button
									type="button"
									onClick={() =>
										handleUpsertDialogOpen({ type: FinancialType.Cost })
									}
								>
									<FaPlus />
									افزودن هزینه جدید
								</Button>
							</CardNav>
						)}
					</CardHeader>
					<CardContent className="px-0">
						<FinancialsTable
							items={financials}
							loading={isLoading}
							canAct={canAct}
							onChange={queryFn}
							onEdit={handleUpsertDialogOpen}
						/>
					</CardContent>
				</Card>
			</div>

			<FinancialUpsertDialog
				payload={{
					financial:
						upsertDialogPayload && "item" in upsertDialogPayload
							? upsertDialogPayload
							: null,
					financialType: upsertDialogPayload?.type,
					instanceId: task.instanceId,
					caseNo: task.caseNo,
				}}
				open={upsertDialogOpen}
				onClose={handleUpsertDialogClose}
			/>
		</>
	);
}

function FinancialsTable({
	items,
	loading,
	canAct,
	onChange,
	onEdit,
}: {
	items: Financial[] | undefined;
	loading: boolean;
	canAct: boolean;
	onChange: () => void;
	onEdit: (financial: Financial) => void;
}) {
	return (
		<Table
			loading={loading}
			slotProps={{ root: { className: "rounded-none border-x-0" } }}
		>
			<TableHeader>
				<TableRow className="whitespace-nowrap">
					<TableHead className="w-16">#</TableHead>
					<TableHead className="w-36">نوع</TableHead>
					<TableHead className="w-48">عنوان</TableHead>
					<TableHead className="w-52">مبلغ</TableHead>
					<TableHead className="w-52">وضعیت</TableHead>
					<TableHead>توضیحات</TableHead>
					{canAct && <TableHead className="w-24">عملیات</TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				{items?.map((financial, index) => (
					<FinancialTableRow
						key={financial.item.id}
						financial={financial}
						index={index}
						canAct={canAct}
						onChange={onChange}
						onEdit={onEdit}
					/>
				))}
			</TableBody>
		</Table>
	);
}

function FinancialTableRow({
	financial,
	index,
	canAct,
	onChange,
	onEdit,
}: {
	financial: Financial;
	index: number;
	canAct: boolean;
	onChange: () => void;
	onEdit: (financial: Financial) => void;
}) {
	return financial.type === FinancialType.Income ? (
		<IncomeTableRow financial={financial} index={index} canAct={canAct} />
	) : (
		<CostTableRow
			financial={financial}
			index={index}
			canAct={canAct}
			onChange={onChange}
			onEdit={onEdit}
		/>
	);
}

function IncomeTableRow({
	financial,
	index,
	canAct,
}: {
	financial: FinancialIncome;
	index: number;
	canAct: boolean;
}) {
	const { item: income } = financial;

	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>
				<Badge className="bg-blue-100 text-blue-900">
					<FaCaretUp />
					<span>درآمد</span>
				</Badge>
			</TableCell>
			<TableCell>{income.title}</TableCell>
			<TableCell>
				<div className="-mb-0.5 flex flex-col gap-1.5 text-xs">
					{income.currency &&
						income.currencyRate &&
						income.currency !== Currency.Rial && (
							<span>
								{income.amount} {currency[income.currency].title} با نرخ{" "}
								{toCurrency(income.currencyRate.toString())} ریال
							</span>
						)}

					<span>{toCurrency(income.total.toString())} ریال</span>
				</div>
			</TableCell>
			<TableCell>
				<IncomeStatusBadge status={income.status} />
			</TableCell>
			<TableCell className="whitespace-pre-line">
				{income.description || "-"}
			</TableCell>
			{canAct && <TableCell></TableCell>}
		</TableRow>
	);
}

function CostTableRow({
	financial,
	index,
	canAct,
	onChange,
	onEdit,
}: {
	financial: FinancialCost;
	index: number;
	canAct: boolean;
	onChange: () => void;
	onEdit: (financial: Financial) => void;
}) {
	const { identity } = useLoggedInUser();

	const isConfidentialUser = useMemo<boolean>(
		() => identity.type === UserType.System || identity.groups.includes("ceo"),
		[identity],
	);

	const { item: cost } = financial;

	const service: CostServiceConfig = cost.category?.key
		? costService[cost.category.key as CostService]
		: {
				accessType: CostServiceAccessType.Open,
				isEditable: true,
				isDeletable: true,
				isMultiple: true,
			};

	const canEdit =
		cost.status === CostStatus.Unpaid &&
		(service.isEditable === undefined || service.isEditable);
	const canDelete = cost.status === CostStatus.Unpaid && service.isDeletable;
	const hasActions = canEdit || canDelete;

	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>
				<Badge className="bg-yellow-100 text-yellow-900">
					<FaCaretDown />
					<span>هزینه</span>
				</Badge>
			</TableCell>
			<TableCell>
				<div className="flex flex-col gap-y-0.5">
					<span>{cost.title}</span>
					{cost.personName && (
						<span className="text-muted-foreground">{cost.personName}</span>
					)}
				</div>
			</TableCell>
			{isConfidentialUser ||
			cost.personId === identity.id ||
			service.accessType === CostServiceAccessType.Open ? (
				<>
					<TableCell>
						<CostItemPaymentAmount cost={cost} />
					</TableCell>
					<TableCell>
						<CostStatusBadge status={cost.status} />
					</TableCell>
					<TableCell className="whitespace-pre-line">
						{cost.description || "-"}
					</TableCell>
					{canAct && (
						<TableCell>
							{hasActions && (
								<TooltipProvider>
									<TableActions>
										{canEdit && (
											<TableAction>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															className="size-full focus-within:text-yellow-600 hover:text-yellow-600 active:text-yellow-600"
															size="icon"
															type="button"
															variant="link"
															onClick={() => {
																onEdit(financial);
															}}
														>
															<FaPenToSquare />
														</Button>
													</TooltipTrigger>
													<TooltipContent>ویرایش هزینه</TooltipContent>
												</Tooltip>
											</TableAction>
										)}

										{canDelete && (
											<TableAction>
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															className="size-full focus-within:text-red-600 hover:text-red-600 active:text-red-600"
															size="icon"
															type="button"
															variant="link"
															onClick={async () => {
																await deleteCost(cost.id);
																onChange();
															}}
														>
															<FaTrash />
														</Button>
													</TooltipTrigger>
													<TooltipContent>حذف هزینه</TooltipContent>
												</Tooltip>
											</TableAction>
										)}
									</TableActions>
								</TooltipProvider>
							)}
						</TableCell>
					)}
				</>
			) : (
				<TableCell colSpan={100}>
					<Separator className="my-4 h-2 w-auto max-w-16 bg-gray-200" />
				</TableCell>
			)}
		</TableRow>
	);
}

export { FinancialsWidget };
