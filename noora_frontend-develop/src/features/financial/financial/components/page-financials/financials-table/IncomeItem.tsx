"use client";

import { FaEllipsis, FaFilePen, FaPenToSquare, FaTrash } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableAction, TableActions, TableCell } from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { currency, Currency } from "@/enums/Currency";
import {
	Financial,
	FinancialIncome,
} from "@/financial/financial/models/Financial";
import { IncomeDeleteAction } from "@/financial/incomes/components/income-delete/IncomeDeleteAction";
import { IncomeStatusBadge } from "@/financial/incomes/components/IncomeStatusBadge";
import { IncomeStatus } from "@/financial/incomes/enums/IncomeStatus";
import { toCurrency } from "@/utils/String";

function IncomeItem({
	financial,
	onSelect,
	onChange,
}: {
	financial: FinancialIncome;
	onSelect: (details: { financial: Financial; force?: boolean }) => void;
	onChange: () => void;
}) {
	const { isAuthorized } = useLoggedInUser();

	const { item: income } = financial;

	const canEdit = income.status === IncomeStatus.Unpaid;
	const canForceEdit = isAuthorized({
		groups: ["financial-expert", "financial-assistant"],
	});
	const canDelete = income.status === IncomeStatus.Unpaid;
	const hasMoreActions = canForceEdit || canDelete;
	const hasActions = canEdit || hasMoreActions;

	return (
		<>
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
												variant="link"
												onClick={() => {
													onSelect({ financial });
												}}
											>
												<FaPenToSquare />
											</Button>
										</TooltipTrigger>
										<TooltipContent>ویرایش درآمد</TooltipContent>
									</Tooltip>
								</TableAction>
							)}

							{hasMoreActions && (
								<TableAction>
									<DropdownMenu>
										<DropdownMenuTrigger className="flex size-full items-center justify-center">
											<FaEllipsis />
										</DropdownMenuTrigger>
										<DropdownMenuContent className="min-w-32">
											{canForceEdit && (
												<DropdownMenuItem
													onSelect={() => {
														onSelect({ financial, force: true });
													}}
													className="flex items-center gap-2"
												>
													<div className="flex grow items-center gap-2">
														<FaFilePen />
														<span>ویرایش درآمد (حسابداری)</span>
													</div>
												</DropdownMenuItem>
											)}

											{canDelete && (
												<IncomeDeleteAction income={income}>
													<DropdownMenuItem>
														<div className="flex items-center gap-2">
															<FaTrash />
															<span>حذف درآمد</span>
														</div>
													</DropdownMenuItem>
												</IncomeDeleteAction>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableAction>
							)}
						</TableActions>
					</TooltipProvider>
				)}
			</TableCell>
		</>
	);
}

export { IncomeItem };
