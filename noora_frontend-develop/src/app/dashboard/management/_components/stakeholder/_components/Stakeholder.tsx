"use client";

import moment from "moment-jalaali";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
	FaAnglesLeft,
	FaCircleExclamation,
	FaRegFileExcel,
	FaRegSquareMinus,
	FaRegSquarePlus,
} from "react-icons/fa6";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { currency, Currency } from "@/enums/Currency";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { createInstance } from "@/felo/instances/services/createInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { getMyNextTask } from "@/felo/tasks/services/getMyNextTask";
import { costStatus, CostStatus } from "@/financial/costs/enums/CostStatus";
import { Cost } from "@/financial/costs/models/Cost";
import { updateCostsPayment } from "@/financial/costs/services/updateCostsPayment";
import { InspectionPaymentStatusBadge } from "@/inspection/components/InspectionPaymentStatusBadge";
import {
	invoicePaymentStatus,
	InvoicePaymentStatus,
} from "@/inspection/models/InvoicePaymentStatus";
import { cn } from "@/lib/utils";
import { toCurrency } from "@/utils/String";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

export function Stakeholder({
	costs,
	loading,
	getData,
	setLoading,
	user,
	pagination,
}: {
	costs: Cost[] | undefined;
	loading: boolean;
	getData: () => void;
	setLoading: (s: boolean) => void;
	user: any;
	pagination: ReactNode;
}) {
	const router = useRouter();

	const [selectedItems, setSelectedItems] = useState<Cost[]>([]);
	const totalPrice = useMemo<number | null>(() => {
		let currency: Currency | undefined;
		let sum = 0;

		for (let item of selectedItems) {
			const itemCurrency = item.currency ?? Currency.Rial;

			if (!currency) {
				currency = itemCurrency;
			}

			if (itemCurrency !== currency) {
				sum = -1;
				break;
			}

			if (itemCurrency === Currency.Rial) {
				sum += Number(item.total || 0);
			} else {
				sum += Number(item.amount || 0);
			}
		}

		if (sum === -1) {
			return null;
		}

		return sum;
	}, [selectedItems]);

	const handleCheckedChange = (value: boolean, item: Cost) => {
		if (value) {
			setSelectedItems((prev) => [...prev, item]);
		} else {
			setSelectedItems((prev) => prev.filter((x) => x.id !== item.id));
		}
	};

	function checkItems(mode: "+" | "-") {
		if (!costs || !costs.length) {
			return;
		}

		if (mode === "+") {
			setSelectedItems((prev) => [
				...new Set([
					...prev,
					...costs.filter((x) => x.status === CostStatus.Unpaid),
				]),
			]);
		} else {
			setSelectedItems((prev) =>
				prev.filter((x) => !costs.some((y) => x.id === y.id)),
			);
		}
	}

	async function createPaymentOrder() {
		if (typeof totalPrice !== "number") {
			toast.error("موارد انتخاب شده نمی توانند از ارزهای متفاوت باشند.");
			return;
		}

		try {
			setLoading(true);

			const process = await getProcessByKey("paymentOrder");

			if (process) {
				let res = await createInstance({
					processId: process?.id,
					parameters: {
						Assignees: user?.id,
						Amount: totalPrice?.toString(),
						Title: `${user?.name} ${user?.lastname} - پرداخت ذی نفع`,
						Description: selectedItems
							?.map((item) => `درخواست ${item.caseNo}`)
							.join(", "),
						BankAccountNumber: user?.bankAccountNumber,
						BankCardNumber: user?.bankCardNumber,
						Sheba: user?.bankSheba,
						BankAccountsOwner: user?.bankAccountOwner,
						// PaymentDate: new Date(),
						Priority: "normal",
						ProcessType: "beneficiary",
						RemainingAmount: totalPrice.toString(),
						CostsIds: selectedItems.map((x) => x.id),
						Currency: selectedItems[0].currency,
						UserInformation: user,
						InputType: "official",
					},
				});

				if (res) {
					let update = await updateCostsPayment({
						costIds: selectedItems.map((x) => x.id),
						payment: { caseNo: res?.caseNo, instanceId: res?.id },
					});

					if (update) {
						const nextTask = await getMyNextTask(res.id);

						toast.success(
							<div
								className="flex w-full flex-col gap-1"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
								}}
							>
								<span>
									دستور پرداخت با شماره {res.caseNo} با موفقیت ایجاد شد!
								</span>

								{nextTask && (
									<div className="flex">
										<Button
											className="ms-auto flex items-center gap-1 font-semibold text-green-700 underline underline-offset-[6px]"
											size="sm"
											variant="link"
											onClick={() => {
												router.push(
													getDynamicUrl(`/dashboard/tasks/${nextTask.taskId}`),
												);
											}}
										>
											<FaAnglesLeft size={8} />
											<span>انتقال به دستور پرداخت</span>
										</Button>
									</div>
								)}
							</div>,
						);

						setSelectedItems([]);
						getData();
					}
				}
			}
		} catch {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		} finally {
			setLoading(false);
		}
	}

	async function generateExcel() {
		if (!selectedItems.length) {
			return;
		}

		const data = [] as any;
		selectedItems.map((item, index) => {
			data.push({
				ردیف: index + 1,
				"عنوان درخواست": item.instance?.name || "-",
				"شماره درخواست": item.caseNo || "-",
				عنوان: item.title || "-",
				مبلغ: Number(item.total) || "-",
				"وضعیت پرداخت درخواست":
					invoicePaymentStatus[
						item.instance?.invoicePaymentStatus ?? InvoicePaymentStatus.Unpaid
					],
			});
		});

		const workbook = {
			SheetNames: ["Sheet 1"],
			Sheets: {},
		};
		const worksheet = XLSX.utils.json_to_sheet(data);
		// @ts-ignore
		workbook.Sheets["Sheet 1"] = worksheet;

		XLSX.writeFile(
			workbook,
			"InspectionReport-" +
				moment(new Date()).format("jYYYY/jMM/jDD - HH:mm") +
				".xlsx",
		);
	}

	useEffect(() => {
		setSelectedItems([]);
	}, [user?.id]);

	return (
		<>
			{!!costs?.length && (
				<div className="flex flex-col justify-between gap-x-6 gap-y-3 xs:flex-row">
					<div className="flex flex-col justify-end gap-3 xs:flex-row">
						<Button variant="secondary" onClick={() => checkItems("+")}>
							<FaRegSquarePlus />
							<span>انتخاب همه</span>
						</Button>

						{!!selectedItems.length && (
							<Button variant="destructive" onClick={() => checkItems("-")}>
								<FaRegSquareMinus />
								<span>لغو {selectedItems.length} مورد انتخاب شده</span>
							</Button>
						)}
					</div>

					<Button onClick={generateExcel}>
						<FaRegFileExcel />
						<span>دانلود گزارش اکسل</span>
					</Button>
				</div>
			)}

			<Card>
				<CardContent className="space-y-6 px-0 pt-6">
					<Table
						loading={loading}
						pagination={pagination}
						slotProps={{ root: { className: "rounded-none border-x-0" } }}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-16"></TableHead>
								<TableHead className="w-1">#</TableHead>
								<TableHead>عنوان</TableHead>
								<TableHead className="w-60">وضعیت</TableHead>
								<TableHead className="w-80">مبلغ</TableHead>
								<TableHead className="w-[44rem]">درخواست بازرسی</TableHead>
								<TableHead className="w-60">تاریخ ایجاد</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{costs ? (
								costs.length ? (
									costs.map((cost, index: number) => {
										const selected = selectedItems.some(
											(x) => x.id === cost.id,
										);

										return (
											<TableRow
												key={cost.id}
												className={cn(
													"whitespace-nowrap",
													selected &&
														"bg-gradient-to-l from-primary-100 to-white",
												)}
											>
												<TableCell>
													{cost.status === CostStatus.Unpaid && (
														<Checkbox
															checked={selected}
															onCheckedChange={(value) => {
																handleCheckedChange(!!value, cost);
															}}
														/>
													)}
												</TableCell>
												<TableCell>{index + 1}</TableCell>
												<TableCell>{cost.title || "-"}</TableCell>
												<TableCell>
													<Badge
														className={cn(
															"bg-gray-100 text-gray-900",
															cost.status === CostStatus.Paid &&
																"bg-green-100 text-green-900",
															cost.status === CostStatus.Pending &&
																"bg-yellow-100 text-yellow-900",
														)}
													>
														{costStatus[cost.status]}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="-mb-0.5 flex flex-col gap-1.5">
														{cost.currency &&
															cost.currencyRate &&
															cost.currency !== Currency.Rial && (
																<div>
																	<span className="tracking-wide">
																		{cost.amount}
																	</span>{" "}
																	{currency[cost.currency].title} با نرخ{" "}
																	<span className="tracking-wide">
																		{toCurrency(cost.currencyRate.toString())}
																	</span>{" "}
																	ریال
																</div>
															)}

														<div>
															{cost.currency &&
																cost.currencyRate &&
																cost.currency !== Currency.Rial &&
																"معادل"}{" "}
															<span className="tracking-wide">
																{toCurrency(cost.total)}
															</span>{" "}
															ریال
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-3">
														<span className="relative top-[1px] tracking-wide text-muted-foreground">
															{cost.caseNo || "-"}
														</span>
														<span>{cost.instance?.name || "-"}</span>
														<InstanceStatusBadge
															instance={{
																status: cost.instance?.status as InstanceStatus,
															}}
														/>
														<InspectionPaymentStatusBadge
															status={cost.instance?.invoicePaymentStatus}
														/>
													</div>
												</TableCell>
												<TableCell>
													{cost.instance?.createdAt
														? moment(cost.instance?.createdAt).format(
																"jYYYY/jMM/jDD",
															)
														: "-"}
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
									</TableRow>
								)
							) : (
								<TableRow>
									<TableCell colSpan={100}>
										لطفا ابتدا کاربر مورد نظر خود را انتخاب نمایید.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{!!selectedItems.length && (
				<div className="flex flex-col items-center gap-x-12 gap-y-6 xs:flex-row sm:self-end">
					<div className="flex flex-col items-center gap-x-12 gap-y-3 xs:me-auto xs:items-start sm:flex-row sm:items-center">
						<div className="flex cursor-default gap-3">
							<span className="text-muted-foreground">تعداد:</span>
							<div>
								<span className="tracking-wide" dir="ltr">
									{toCurrency(selectedItems.length.toString())}
								</span>{" "}
								مورد
							</div>
						</div>

						<div className="flex cursor-default gap-3">
							<span className="text-muted-foreground">مبلغ مجموع:</span>
							<div>
								{typeof totalPrice === "number" ? (
									<>
										<span className="tracking-wide" dir="ltr">
											{toCurrency(totalPrice.toString())}
										</span>{" "}
										{currency[selectedItems[0].currency ?? Currency.Rial].title}
									</>
								) : (
									<div className="flex items-center gap-2 text-red-600">
										<FaCircleExclamation />
										<span className="text-bold">خطا در محاسبه</span>
									</div>
								)}
							</div>
						</div>
					</div>

					<Button
						className="w-full xs:w-32"
						// disabled={typeof totalPrice !== "number"}
						variant="primary"
						onClick={createPaymentOrder}
					>
						ثبت
					</Button>
				</div>
			)}
		</>
	);
}
