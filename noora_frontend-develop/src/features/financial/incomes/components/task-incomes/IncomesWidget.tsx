"use client";

import { useCallback, useState } from "react";
import { FaPenToSquare, FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
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
import { Currency, currency } from "@/enums/Currency";
import { TaskStatus } from "@/felo/tasks/enums/TaskStatus";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { IncomeStatus } from "@/financial/incomes/enums/IncomeStatus";
import { Income } from "@/financial/incomes/models/Income";
import { deleteIncome } from "@/financial/incomes/services/deleteIncome";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";
import { toCurrency } from "@/utils/String";

import { isLockedIncomeErrorMessage } from "../../utils/isLockedIncomeErrorMessage";
import { IncomeUpsertDialog } from "../income-upsert/IncomeUpsertDialog";
import { IncomeStatusBadge } from "../IncomeStatusBadge";

function IncomesWidget() {
	const { task } = useTaskContext();

	const canAct = task.status === TaskStatus.Todo;

	const queryFn = useCallback(async () => {
		const incomes = await getIncomes({
			filters: { instanceId: task.instanceId, isDeleted: false },
			populate: ["categoryId"],
		});

		return [incomes, incomes.length] as const;
	}, [task.instanceId]);

	const {
		items: incomes,
		isLoading,
		error,
		refetch,
	} = usePagination<Income>(queryFn);

	const [upsertDialogOpen, setUpsertDialogOpen] = useState<boolean>(false);
	const [upsertDialogPayload, setUpsertDialogPayload] = useState<Income>();

	const handleUpsertDialogOpen = useCallback((payload?: Income) => {
		setUpsertDialogPayload(payload);
		setUpsertDialogOpen(true);
	}, []);

	const handleUpsertDialogClose = useCallback(
		(result?: boolean) => {
			setUpsertDialogOpen(false);
			if (result) refetch();
		},
		[refetch],
	);

	return (
		<>
			<div className="col-span-full !col-start-1 space-y-3 xl:col-span-9 2xl:col-span-8">
				<Card>
					<CardHeader orientation="horizontal">
						<CardTitle>درآمدها</CardTitle>
						{canAct && (
							<CardNav>
								<Button type="button" onClick={() => handleUpsertDialogOpen()}>
									<FaPlus />
									افزودن درآمد جدید
								</Button>
							</CardNav>
						)}
					</CardHeader>
					<CardContent className="px-0">
						<IncomesTable
							incomes={incomes}
							loading={isLoading}
							canAct={canAct}
							onChange={refetch}
							onEdit={handleUpsertDialogOpen}
						/>
					</CardContent>
				</Card>
			</div>

			<IncomeUpsertDialog
				payload={{
					income: upsertDialogPayload,
					instanceId: task.instanceId,
				}}
				open={upsertDialogOpen}
				onClose={handleUpsertDialogClose}
			/>
		</>
	);
}

function IncomesTable({
	incomes,
	loading,
	canAct,
	onChange,
	onEdit,
}: {
	incomes: Income[];
	loading: boolean;
	canAct: boolean;
	onChange: () => void;
	onEdit: (income: Income) => void;
}) {
	return (
		<Table
			loading={loading}
			slotProps={{ root: { className: "rounded-none border-x-0" } }}
		>
			<TableHeader>
				<TableRow className="whitespace-nowrap">
					<TableHead className="w-16">#</TableHead>
					<TableHead className="w-48">عنوان</TableHead>
					<TableHead className="w-52">مبلغ</TableHead>
					<TableHead className="w-52">وضعیت</TableHead>
					<TableHead>توضیحات</TableHead>
					{canAct && <TableHead className="w-24">عملیات</TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				{incomes.length ? (
					incomes.map((income, index) => (
						<IncomesTableRow
							key={income.id}
							income={income}
							index={index}
							canAct={canAct}
							onChange={onChange}
							onEdit={onEdit}
						/>
					))
				) : (
					<TableRow>
						<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

function IncomesTableRow({
	income,
	index,
	canAct,
	onChange,
	onEdit,
}: {
	income: Income;
	index: number;
	canAct: boolean;
	onChange: () => void;
	onEdit: (income: Income) => void;
}) {
	const canEdit = income.status === IncomeStatus.Unpaid;
	const canDelete = income.status === IncomeStatus.Unpaid;
	const hasActions = canEdit || canDelete;

	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>{income.category?.title}</TableCell>
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
														onEdit(income);
													}}
												>
													<FaPenToSquare />
												</Button>
											</TooltipTrigger>
											<TooltipContent>ویرایش درآمد</TooltipContent>
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
														try {
															await deleteIncome(income.id);
															onChange();
														} catch (err) {
															console.error(err);

															let errorMessage: string | undefined;
															if (isApiResponse(err)) {
																if (
																	isLockedIncomeErrorMessage(err) ||
																	isLockedInvoiceErrorMessage(err)
																) {
																	errorMessage =
																		"امکان انجام این عملیات وجود ندارد.";
																}
															}

															toast.error(
																errorMessage ||
																	"خطای نامشخصی در هنگام حذف درآمد رخ داد.",
															);
														}
													}}
												>
													<FaTrash />
												</Button>
											</TooltipTrigger>
											<TooltipContent>حذف درآمد</TooltipContent>
										</Tooltip>
									</TableAction>
								)}
							</TableActions>
						</TooltipProvider>
					)}
				</TableCell>
			)}
		</TableRow>
	);
}

export { IncomesWidget };
