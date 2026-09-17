"use client";

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { FaPenToSquare, FaPlus, FaTrash } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
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
import { currency, Currency } from "@/enums/Currency";
import { IncomeDeleteAction } from "@/financial/incomes/components/income-delete/IncomeDeleteAction";
import { IncomeUpsertDialog } from "@/financial/incomes/components/income-upsert/IncomeUpsertDialog";
import { IncomeStatusBadge } from "@/financial/incomes/components/IncomeStatusBadge";
import { IncomeStatus } from "@/financial/incomes/enums/IncomeStatus";
import { IncomeType } from "@/financial/incomes/enums/IncomeType";
import { incomeUnit } from "@/financial/incomes/enums/IncomeUnit";
import { Income } from "@/financial/incomes/models/Income";
import { IncomeQueryFilter } from "@/financial/incomes/models/IncomeQuery";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { cn } from "@/lib/utils";
import { Head } from "@/ui/Head";
import { toCurrency } from "@/utils/String";

type IncomeListContextType = {
	openUpsertDialog: (income?: Income) => void;
};

const IncomeListContext = createContext<IncomeListContextType>({
	openUpsertDialog: () => {},
});

function IncomeList() {
	const { identity, isAuthorized } = useLoggedInUser();

	const canSeeAll = useMemo<boolean>(
		() =>
			isAuthorized({
				groups: ["ceo", "financial-expert", "financial-assistant"],
			}),
		[isAuthorized],
	);

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const filters: IncomeQueryFilter = {
				type: { $ne: IncomeType.Instance },
			};

			if (!canSeeAll) {
				filters.createdBy = identity.id;
			}

			const incomes = await getIncomes({
				filters,
				sort: { updatedAt: "desc" },
				populate: ["categoryId", "createdBy", "updatedBy"],
				pagination: { page, pageSize },
			});

			return [incomes.items, incomes.total] as const;
		},
		[canSeeAll, identity.id],
	);

	const { items, isLoading, error, offset, page, refetch, Pagination } =
		usePagination<Income>(queryFn);

	const [upsertOpen, setUpsertOpen] = useState<boolean>(false);
	const [upsertPayload, setUpsertPayload] = useState<
		Partial<{ income: Income }>
	>({});

	const handleUpsertDialogOpen = useCallback((income?: Income) => {
		setUpsertOpen(true);
		setUpsertPayload({ income });
	}, []);

	const handleUpsertDialogClose = useCallback(
		(result?: boolean) => {
			setUpsertOpen(false);
			if (result) {
				refetch();
			}
		},
		[refetch],
	);

	const ctxValue = useMemo<IncomeListContextType>(
		() => ({
			openUpsertDialog: handleUpsertDialogOpen,
		}),
		[handleUpsertDialogOpen],
	);

	return (
		<IncomeListContext.Provider value={ctxValue}>
			<div className="space-y-8">
				<Head.Root>
					<Head.Title>لیست درآمدهای آزاد</Head.Title>
					<Head.Nav className="sm:ms-auto">
						<Button variant="primary" onClick={() => handleUpsertDialogOpen()}>
							<FaPlus />
							<span>ایجاد درآمد آزاد جدید</span>
						</Button>

						<IncomeUpsertDialog
							payload={upsertPayload}
							open={upsertOpen}
							onClose={handleUpsertDialogClose}
						/>
					</Head.Nav>
				</Head.Root>

				<Card>
					<CardContent className="px-0 pt-6">
						<IncomeTable
							items={items}
							loading={isLoading}
							offset={offset}
							pagination={<Pagination />}
						/>
					</CardContent>
				</Card>
			</div>
		</IncomeListContext.Provider>
	);
}

function IncomeTable({
	items,
	loading,
	offset,
	pagination,
}: {
	items: Income[];
	loading: boolean;
	offset: number;
	pagination: React.ReactNode;
}) {
	return (
		<>
			<Table
				loading={loading}
				pagination={pagination}
				slotProps={{ root: { className: "rounded-none border-x-0" } }}
			>
				<TableHeader>
					<TableRow className="whitespace-nowrap">
						<TableHead className="w-16">#</TableHead>
						<TableHead className="w-60">عنوان</TableHead>
						<TableHead className="w-40">وضعیت</TableHead>
						<TableHead className="w-56">مبلغ</TableHead>
						<TableHead className="w-28">تعداد</TableHead>
						<TableHead className="w-28">واحد</TableHead>
						<TableHead>توضیحات</TableHead>
						<TableHead className="w-40">زمان ایجاد</TableHead>
						<TableHead className="w-40">آخرین بروزرسانی</TableHead>
						<TableHead className="w-32">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length ? (
						items.map((income, index) => (
							<IncomeRow key={income.id} item={income} index={offset + index} />
						))
					) : (
						<TableRow>
							<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}

function IncomeRow({ item, index }: { item: Income; index: number }) {
	const { openUpsertDialog } = useContext(IncomeListContext);

	const canEdit = item.status === IncomeStatus.Unpaid;
	// const canDelete = item.status === IncomeStatus.Unpaid;
	const canDelete = false;
	const hasActions = !item.isDeleted && (canEdit || canDelete);

	function handleEditClick() {
		openUpsertDialog(item);
	}

	return (
		<TableRow
			className={cn(
				"whitespace-nowrap",
				item.isDeleted && "cursor-not-allowed select-none opacity-50",
			)}
		>
			<TableCell>{index + 1}</TableCell>
			<TableCell>{item.category?.title}</TableCell>
			<TableCell>
				{!item.isDeleted && <IncomeStatusBadge status={item.status} />}
				{item.isDeleted && (
					<Badge className="bg-red-100 text-red-900">حذف شده</Badge>
				)}
			</TableCell>
			<TableCell>
				<div className="-mb-0.5 flex flex-col gap-1.5 text-xs">
					{item.currency &&
						item.currencyRate &&
						item.currency !== Currency.Rial && (
							<span>
								{item.amount} {currency[item.currency].title} با نرخ{" "}
								{toCurrency(item.currencyRate.toString())} ریال
							</span>
						)}

					<span>{toCurrency(item.total.toString())} ریال</span>
				</div>
			</TableCell>
			<TableCell className="tracking-wide">{item.quantity}</TableCell>
			<TableCell>{incomeUnit[item.unit]?.title}</TableCell>
			<TableCell className="whitespace-pre-line">
				{item.description || "-"}
			</TableCell>
			<TableCell>
				<IncomeHistoryInfo user={item.createdBy} date={item.createdAt} />
			</TableCell>
			<TableCell>
				<IncomeHistoryInfo user={item.updatedBy} date={item.updatedAt} />
			</TableCell>
			<TableCell>
				{hasActions && (
					<TableActions>
						<TooltipProvider>
							{canEdit && (
								<TableAction>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												className="size-full focus-within:text-yellow-600 hover:text-yellow-600 active:text-yellow-600"
												size="icon"
												type="button"
												variant="link"
												onClick={handleEditClick}
											>
												<FaPenToSquare />
											</Button>
										</TooltipTrigger>
										<TooltipContent>ویرایش درآمد</TooltipContent>
									</Tooltip>
								</TableAction>
							)}

							{canDelete && (
								<IncomeDeleteAction income={item}>
									<TableAction>
										<Tooltip>
											<TooltipTrigger
												className={cn(
													buttonVariants({ size: "icon", variant: "link" }),
													"size-full focus-within:text-red-600 hover:text-red-600 active:text-red-600",
												)}
											>
												<FaTrash />
											</TooltipTrigger>
											<TooltipContent>حذف درآمد</TooltipContent>
										</Tooltip>
									</TableAction>
								</IncomeDeleteAction>
							)}
						</TooltipProvider>
					</TableActions>
				)}
			</TableCell>
		</TableRow>
	);
}

function IncomeHistoryInfo({
	user,
	date,
}: {
	user?: UserLookup;
	date: string;
}) {
	return (
		<div className="space-y-2 text-xs">
			{user && <div>{user.name}</div>}
			<DateTime date={date} />
		</div>
	);
}

export { IncomeList };
