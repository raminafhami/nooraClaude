"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  FaArrowUpRightFromSquare,
  FaCheck,
  FaCheckDouble,
  FaHourglassHalf,
} from "react-icons/fa6";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { CaseType } from "@/inspection/models/CaseType";
import { inspectionType } from "@/inspection/models/InspectionType";
import { cn } from "@/lib/utils";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { toCurrency } from "@/utils/String";

import { ActionName } from "../../../models/ActionName";
import {
  CasePaymentStatus,
  casePaymentStatus,
} from "../../../models/CasePaymentStatus";
import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";

export default function CaseTable(): JSX.Element {
	const {
		task: { data },
	} = useTaskContext();
	const { watch } = useFormContext<FormData>();

	const { [ids.inspectionCases]: cases } = watch();

	const { [ids.actionName]: actionName } = data;

	const isActionReceipt = useMemo<boolean>(
		() => !actionName || actionName === ActionName.Receipt,
		[actionName],
	);

	return (
		<>
			<div className="col-span-full">
				<label>درخواست ها:</label>
				<Panel.Root className="mt-2">
					<Table.Root>
						<Table.Head>
							<Table.Row className="bg-gray-100 text-right">
								<Table.Cell as="th" className="w-16">
									ردیف
								</Table.Cell>
								<Table.Cell as="th" className="w-44">
									اطلاعات درخواست
								</Table.Cell>
								<Table.Cell as="th" className="w-56">
									خریدار
								</Table.Cell>
								<Table.Cell as="th" className="w-60">
									فاکتور درخواست
								</Table.Cell>
								<Table.Cell as="th" className="w-44">
									مبلغ باقی مانده
								</Table.Cell>
								{isActionReceipt && (
									<>
										<Table.Cell as="th" className="w-44">
											مبلغ پرداختی
										</Table.Cell>
										<Table.Cell as="th" className="w-60">
											وضعیت پرداخت
										</Table.Cell>
									</>
								)}
								<Table.Cell as="th"></Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{cases.map((caseItem, index) => {
								const remaining =
									parseInt(caseItem.invoiceRemaining) -
									parseInt(caseItem.paymentAmount);

								return (
									<Table.Row key={caseItem.caseNo}>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>
											<div className="space-y-1">
												<div>
													{inspectionType[caseItem.inspectionType].title}
												</div>
												<div className="text-xs text-gray-600">
													شماره: {caseItem.caseNo}
												</div>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div className="flex flex-col">
												<div className="flex items-center gap-2">
													<span>{caseItem.buyer.name}</span>
													<DynamicLink
														href={`/dashboard/contacts/buyers/${caseItem.buyer.id}`}
													>
														<FaArrowUpRightFromSquare size={10} />
													</DynamicLink>
												</div>
												{(data[ids.caseType] === CaseType.Official ||
													caseItem.buyer.sepidarId) && (
													<div
														className={cn(
															"text-xs text-gray-600",
															data[ids.caseType] === CaseType.Official &&
																!caseItem.buyer.sepidarId &&
																"text-red-700",
														)}
													>
														شناسه سپیدار: {caseItem.buyer.sepidarId ?? "؟"}
													</div>
												)}
											</div>
										</Table.Cell>
										<Table.Cell>
											<div className="space-y-1">
												<div
													className={cn(!caseItem.invoiceNo && "text-red-700")}
												>
													شماره فاکتور: {caseItem.invoiceNo ?? "؟"}
												</div>
												<div>
													هزینه بازرسی: {toCurrency(caseItem.inspectionFee)}
												</div>
												<div>مالیات: {toCurrency(caseItem.invoiceTax)}</div>
												<div>عوارض: {toCurrency(caseItem.invoiceDuty)}</div>
												<div>مجموع: {toCurrency(caseItem.invoiceTotal)}</div>
											</div>
										</Table.Cell>
										<Table.Cell>
											{toCurrency(caseItem.invoiceRemaining)}
										</Table.Cell>
										{isActionReceipt && (
											<>
												<Table.Cell>
													{toCurrency(caseItem.paymentAmount)}
													{caseItem.paymentStatus ===
														CasePaymentStatus.Complete &&
														!!remaining && (
															<div className="mt-1 text-xs text-red-500">
																مغایرت {toCurrency(remaining.toString())} ریال
															</div>
														)}
												</Table.Cell>
												<Table.Cell>
													<div
														className={cn(
															"flex w-fit items-center gap-x-1 rounded-xl px-3 py-1 text-center text-xs",
															caseItem.paymentStatus ===
																CasePaymentStatus.Complete &&
																"bg-teal-100 text-teal-900",
															caseItem.paymentStatus ===
																CasePaymentStatus.Incomplete &&
																"bg-orange-100 text-orange-900",
															caseItem.paymentStatus ===
																CasePaymentStatus.Ias &&
																"bg-blue-100 text-blue-900",
														)}
													>
														{caseItem.paymentStatus ===
														CasePaymentStatus.Complete ? (
															<FaCheckDouble />
														) : caseItem.paymentStatus ===
														  CasePaymentStatus.Incomplete ? (
															<FaHourglassHalf />
														) : (
															caseItem.paymentStatus ===
																CasePaymentStatus.Ias && <FaCheck />
														)}
														{casePaymentStatus[caseItem.paymentStatus]}
													</div>
												</Table.Cell>
											</>
										)}
										<Table.Cell></Table.Cell>
									</Table.Row>
								);
							})}
						</Table.Body>
					</Table.Root>
				</Panel.Root>
			</div>
		</>
	);
}
