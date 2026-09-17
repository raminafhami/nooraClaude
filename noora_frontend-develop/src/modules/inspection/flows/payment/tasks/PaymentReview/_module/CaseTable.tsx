"use client";

import { memo } from "react";
import { FaCheck, FaCheckDouble, FaHourglassHalf } from "react-icons/fa6";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { inspectionType } from "@/inspection/models/InspectionType";
import { cn } from "@/lib/utils";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { toCurrency } from "@/utils/String";

import { CaseData } from "../../../models/CaseData";
import {
  CasePaymentStatus,
  casePaymentStatus,
} from "../../../models/CasePaymentStatus";
import { ids } from "../../../models/Ids";

export default memo(function CaseTable() {
	const {
		task: { data },
	} = useTaskContext();

	const cases: CaseData[] = data[ids.inspectionCases];

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
								<Table.Cell as="th" className="w-44">
									مبلغ پرداختی
								</Table.Cell>
								<Table.Cell as="th" className="w-60">
									وضعیت پرداخت
								</Table.Cell>
								<Table.Cell as="th"></Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{cases.map((data, i) => {
								const remaining =
									parseInt(data.invoiceRemaining) -
									parseInt(data.paymentAmount);

								return (
									<Table.Row key={data.caseNo}>
										<Table.Cell>{i + 1}</Table.Cell>
										<Table.Cell>
											<div className="space-y-1">
												<div>{inspectionType[data.inspectionType].title}</div>
												<div className="text-xs text-gray-600">
													شماره: {data.caseNo}
												</div>
											</div>
										</Table.Cell>
										<Table.Cell>
											<div className="flex flex-col">
												<div>{data.buyer.name}</div>
												{data.buyer.sepidarId && (
													<div className="text-xs text-gray-600">
														شناسه سپیدار: {data.buyer.sepidarId}
													</div>
												)}
											</div>
										</Table.Cell>
										<Table.Cell>
											<div className="space-y-1">
												<div>
													هزینه بازرسی: {toCurrency(data.inspectionFee)}
												</div>
												<div>مالیات: {toCurrency(data.invoiceTax)}</div>
												<div>عوارض: {toCurrency(data.invoiceDuty)}</div>
												<div>مجموع: {toCurrency(data.invoiceTotal)}</div>
											</div>
										</Table.Cell>
										<Table.Cell>{toCurrency(data.invoiceRemaining)}</Table.Cell>
										<Table.Cell>
											{toCurrency(data.paymentAmount)}
											{data.paymentStatus === CasePaymentStatus.Complete &&
												remaining && (
													<div className="mt-1 text-xs text-red-500">
														مغایرت {toCurrency(remaining.toString())} ریال
													</div>
												)}
										</Table.Cell>
										<Table.Cell>
											<div
												className={cn(
													"flex w-fit items-center gap-x-1 rounded-xl px-3 py-1 text-center text-xs",
													data.paymentStatus === CasePaymentStatus.Complete &&
														"bg-teal-100 text-teal-900",
													data.paymentStatus === CasePaymentStatus.Incomplete &&
														"bg-orange-100 text-orange-900",
													data.paymentStatus === CasePaymentStatus.Ias &&
														"bg-blue-100 text-blue-900",
												)}
											>
												{data.paymentStatus === CasePaymentStatus.Complete ? (
													<FaCheckDouble />
												) : data.paymentStatus ===
												  CasePaymentStatus.Incomplete ? (
													<FaHourglassHalf />
												) : (
													data.paymentStatus === CasePaymentStatus.Ias && (
														<FaCheck />
													)
												)}
												{casePaymentStatus[data.paymentStatus]}
											</div>
										</Table.Cell>
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
});
