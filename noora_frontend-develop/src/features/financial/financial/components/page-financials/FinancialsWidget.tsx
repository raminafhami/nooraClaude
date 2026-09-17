"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	FaEllipsisVertical,
	FaMoneyBillTransfer,
	FaPlus,
} from "react-icons/fa6";
import { toast } from "sonner";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCostsByCase } from "@/financial/costs/services/getCostsByCase";
import { changeInspectionCaseType } from "@/financial/incomes/services/changeInspectionCaseType";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";
import { UserType } from "@/identity/users/models/UserType";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { CaseType } from "@/inspection/models/CaseType";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { getColorForPercentage } from "@/utils/getColorByPercentage";
import { toCurrency } from "@/utils/String";

import { FinancialType } from "../../enums/FinancialType";
import { Financial } from "../../models/Financial";
import { FinancialUpsertDialog } from "../financial-upsert/FinancialUpsertDialog";
import { FinancialsTable } from "./financials-table/FinancialsTable";

function FinancialsWidget() {
	const { identity } = useLoggedInUser();

	const isConfidentialUser = useMemo<boolean>(
		() => identity.type === UserType.System || identity.groups.includes("ceo"),
		[identity],
	);

	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [financials, setFinancials] = useState<Financial[]>();

	const loadFinancials = useCallback(async () => {
		try {
			setIsLoading(true);
			setErrorMessage(undefined);

			const costs = await getCostsByCase(instance.id);
			const incomes = await getIncomes({
				filters: { instanceId: instance.id, isDeleted: false },
			});

			const nextFinancials: Financial[] = [];
			nextFinancials.push(
				...incomes.map((x) => ({ type: "income", item: x }) as Financial),
			);
			nextFinancials.push(
				...costs.map((x) => ({ type: "cost", item: x }) as Financial),
			);

			setFinancials(nextFinancials);
		} catch (err: any) {
			console.error(err);
			setErrorMessage(err.message ?? "خطای نامشخصی رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [instance.id]);

	const handleFinancialsChange = useCallback(async () => {
		await loadFinancials();
	}, [loadFinancials]);

	const [upsertDialog, setUpsertDialog] = useState<boolean>(false);
	const [upsertPayload, setUpsertPayload] = useState<{
		financial: Financial | null;
		financialType: FinancialType;
		force?: boolean;
	}>();

	const handleUpsertDialogOpen = useCallback(
		({
			financial,
			financialType,
			force,
		}: {
			financial?: Financial;
			financialType?: FinancialType;
			force?: boolean;
		}) => {
			if (
				typeof financial === "undefined" &&
				typeof financialType === "undefined"
			) {
				throw new TypeError(
					"both financial and financial cannot be undefined.",
				);
			}

			setUpsertDialog(true);
			setUpsertPayload({
				financial: financial ?? null,
				financialType: (financialType ?? financial?.type)!,
				force,
			});
		},
		[],
	);

	const handleUpsertDialogClose = useCallback(
		(result?: boolean) => {
			setUpsertDialog(false);
			if (result) {
				loadFinancials();
			}
		},
		[loadFinancials],
	);

	useEffect(() => {
		loadFinancials();
	}, [loadFinancials]);

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

	if (errorMessage || (!isLoading && typeof financials === "undefined")) {
		return (
			<DestructiveAlert>
				<AlertDescription>
					{errorMessage || "خطای نامشخصی رخ داده است"}
				</AlertDescription>
			</DestructiveAlert>
		);
	}

	return (
		<>
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						فهرست درآمدها و هزینه ها
						{!isLoading && !errorMessage && (
							<div
								className="flex select-none items-center whitespace-nowrap rounded-xl px-4 py-1 text-xsm"
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
						)}
					</CardTitle>

					<CardNav>
						<Button
							variant="primary"
							onClick={() =>
								handleUpsertDialogOpen({ financialType: FinancialType.Income })
							}
						>
							<FaPlus />
							<span>افزودن درآمد جدید</span>
						</Button>

						<Button
							variant="primary"
							onClick={() =>
								handleUpsertDialogOpen({ financialType: FinancialType.Cost })
							}
						>
							<FaPlus />
							<span>افزودن هزینه جدید</span>
						</Button>

						{instance.parameters["CaseType"] && (
							<DropdownMenu>
								<DropdownMenuTrigger className="h-full focus-visible:outline-none">
									<FaEllipsisVertical />
								</DropdownMenuTrigger>
								<DropdownMenuContent className="min-w-32">
									{instance.parameters["CaseType"] && (
										<DropdownMenuItem
											className="flex items-center gap-2"
											onSelect={async (event) => {
												try {
													const nextCaseType =
														instance.parameters["CaseType"] ===
														CaseType.Official
															? CaseType.Unofficial
															: CaseType.Official;

													await changeInspectionCaseType(
														instance.id,
														nextCaseType,
													);
													onInstanceUpdate({ ["CaseType"]: nextCaseType });
													loadFinancials();
												} catch (err: any) {
													event.preventDefault();

													console.error(err);

													let errorMessage: string | undefined;
													if (isApiResponse(err)) {
														if (err?.message === "Cancel active invoices") {
															errorMessage =
																"تغییر نوع درخواست به دلیل وجود فاکتور فعال امکان پذیر نیست.";
														} else if (
															isLockedIncomeErrorMessage(err) ||
															isLockedInvoiceErrorMessage(err)
														) {
															errorMessage =
																"امکان انجام این عملیات وجود ندارد.";
														}
													}

													toast.error(
														"خطای نامخشصی در هنگام ثبت اطلاعات رخ داد.",
													);
												}
											}}
										>
											<div className="flex grow items-center gap-2">
												<FaMoneyBillTransfer />
												<span>
													تبدیل به درخواست{" "}
													{instance.parameters["CaseType"] === CaseType.Official
														? "غیررسمی"
														: "رسمی"}
												</span>
											</div>
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</CardNav>
				</CardHeader>

				<CardContent className={cn(!isLoading && "px-0")}>
					{typeof financials === "undefined" ? (
						<Loading size="sm">در حال دریافت اطلاعات...</Loading>
					) : (
						<FinancialsTable
							financials={financials}
							loading={isLoading}
							isConfidentialUser={isConfidentialUser}
							isPaid={
								instance.parameters["InvoicePaymentStatus"] ===
								InvoicePaymentStatus.Paid
							}
							onSelect={handleUpsertDialogOpen}
							onChange={handleFinancialsChange}
						/>
					)}
				</CardContent>
			</Card>

			<FinancialUpsertDialog
				open={upsertDialog}
				payload={{
					financial: upsertPayload?.financial ?? null,
					financialType: upsertPayload?.financialType,
					instanceId: instance.id,
					caseNo: instance.caseNo,
					force: upsertPayload?.force,
				}}
				onClose={handleUpsertDialogClose}
			/>
		</>
	);
}

export { FinancialsWidget };
