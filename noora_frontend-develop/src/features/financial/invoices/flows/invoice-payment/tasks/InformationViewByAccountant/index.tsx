"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { z } from "zod";

import { getBuyers } from "@/buyers/services/getBuyers";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DocumentsView } from "@/felo/files/components/documents-view/DocumentsView";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import {
	InvoiceType,
	invoiceType as invoiceTypeType,
} from "@/financial/invoices/enums/InvoiceType";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInvoices } from "@/financial/invoices/services/getInvoices";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { Loading } from "@/ui/Loader";
import { toCurrency } from "@/utils/String";

import { bankAccountOptions } from "../../data/bankAccounts";
import { foreignAccountOptions } from "../../data/foreignAccounts";
import { paymentType, PaymentType } from "../../enums/PaymentType";
import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { InvoiceItem } from "../../models/InvoiceItem";

const schema = z.object({});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { task } = useTaskContext();

	const {
		[ids.invoiceItems]: invoiceItems,
	}: { [ids.invoiceItems]: InvoiceItem[] } = task.data;

	const [isLoadingInvoices, setIsLoadingInvoices] = useState<boolean>(true);
	const [invoices, setInvoices] = useState<Invoice[]>([]);

	const invoiceType = useMemo(() => invoices.at(0)?.type, [invoices]);
	const invoiceRecipient = useMemo(() => invoices.at(0)?.recipient, [invoices]);
	const recipientId = invoiceRecipient
		? (invoiceRecipient.refId ?? null)
		: undefined;
	const [recipientType, setRecipientType] = useState<
		"buyer" | "customer" | "personnel" | null
	>();

	const invoicesTotal = useMemo(
		() =>
			invoices.map((x) => x.total + x.tax).reduce((acc, curr) => acc + curr, 0),
		[invoices],
	);

	useEffect(() => {
		(async () => {
			try {
				if (!invoiceItems?.length) {
					setInvoices([]);
					return;
				}

				setIsLoadingInvoices(true);

				const invoices = await getInvoices({
					filters: { _id: [...new Set(invoiceItems.map((x) => x.id))] },
					populate: ["items", "issuedBy"],
				});
				setInvoices(parseInvoice(invoices));
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoadingInvoices(false);
			}
		})();
	}, [invoiceItems]);

	useEffect(() => {
		(async () => {
			if (typeof recipientId === "undefined") return;

			let recipientType: "buyer" | "customer" | "personnel" | undefined;
			if (recipientId) {
				if (invoiceType === InvoiceType.Official) {
					const buyers = await getBuyers({ filters: { _id: recipientId } });

					if (buyers.length) {
						recipientType = "buyer";
					}
				}

				if (!recipientType) {
					const users = await getUsers({ filters: { _id: recipientId } });

					if (users.length) {
						recipientType =
							users[0].type === UserType.Public ? "customer" : "personnel";
					}
				}
			}

			setRecipientType(recipientType ?? null);
		})();
	}, [invoiceType, recipientId]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<DocumentsView
				instanceId={task.instanceId}
				folders={["receipts"]}
				requiredTypes={["receipt"]}
				seperator={false}
			/>

			<Separator className="col-span-full h-1" />

			<Referrer
				assigneeKey={AssigneeType.Creator}
				title={assigneesTemplate[AssigneeType.Creator]}
				noteId={ids.informationFormNote}
				noteType="info"
			/>

			<Separator className="col-span-full h-1" />

			{invoiceType && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>نوع فاکتور</FormLabel>
					<FormControl>
						<Input disabled value={invoiceTypeType[invoiceType].title} />
					</FormControl>
				</FormItem>
			)}

			{invoiceRecipient && (
				<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel className="flex items-center gap-2">
						<span>گیرنده فاکتور</span>
						{recipientType && (
							<DynamicLink
								href={
									recipientType === "buyer"
										? `/dashboard/contacts/buyers/${recipientId}`
										: recipientType === "customer"
											? `/dashboard/contacts/customers/${recipientId}`
											: `/dashboard/hr/personnel/${recipientId}`
								}
							>
								<FaArrowUpRightFromSquare className="text-2xs" />
							</DynamicLink>
						)}
					</FormLabel>
					<FormControl>
						<Input
							disabled
							value={`${invoiceRecipient.name} ${invoiceRecipient.lastname ?? ""}`.trim()}
						/>
					</FormControl>
				</FormItem>
			)}

			<div className="col-span-full !col-start-1 space-y-3 xl:col-span-10 2xl:col-span-8">
				<Card>
					<CardHeader orientation="horizontal">
						<CardTitle>فاکتورها</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6 px-0">
						<Table
							loading={isLoadingInvoices}
							slotProps={{ root: { className: "rounded-none border-x-0" } }}
						>
							<TableHeader>
								<TableRow className="whitespace-nowrap">
									<TableHead className="w-16">#</TableHead>
									<TableHead className="w-24">شناسه فاکتور</TableHead>
									<TableHead className="w-24">شماره درخواست (ها)</TableHead>
									<TableHead className="w-40">جمع کل</TableHead>
									<TableHead className="w-40">مالیات و عوارض</TableHead>
									<TableHead className="w-40">مبلغ قابل پرداخت</TableHead>
									<TableHead className="w-52">وضعیت صدور</TableHead>
									<TableHead className="w-40">تاریخ انقضا</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices.map((invoice, index) => (
									<TableRow key={invoice.id} className="whitespace-nowrap">
										<TableCell>{index + 1}</TableCell>
										<TableCell>
											{getInvoiceNoSequence(invoice.invoiceNo)}
										</TableCell>
										<TableCell>
											{Array.from(
												new Set(invoice.items?.map((x) => x.caseNo)) ?? [],
											).join("، ") || "-"}
										</TableCell>
										<TableCell>
											<span className="tracking-wide" dir="ltr">
												{toCurrency(invoice.total.toString())}
											</span>
										</TableCell>
										<TableCell>
											<span className="tracking-wide" dir="ltr">
												{toCurrency(invoice.tax.toString())}
											</span>
										</TableCell>
										<TableCell>
											<span className="tracking-wide" dir="ltr">
												{toCurrency((invoice.total + invoice.tax).toString())}
											</span>
										</TableCell>
										<TableCell>
											{invoice.issueNo ? (
												<div className="space-y-2 text-xs">
													{invoice.issuedBy && (
														<div>{invoice.issuedBy.name}</div>
													)}
													<div>
														<span className="tracking-wide text-muted-foreground">
															شماره سپیدار:
														</span>{" "}
														{invoice.issueNo}
													</div>
													{invoice.issuedAt && (
														<div>
															<span className="text-muted-foreground">
																تاریخ:
															</span>{" "}
															{invoice.issuedAt.toLocaleDateString(
																"fa-IR-u-nu-latn",
																{
																	year: "numeric",
																	month: "2-digit",
																	day: "2-digit",
																},
															)}
														</div>
													)}
												</div>
											) : (
												"پیش فاکتور"
											)}
										</TableCell>
										<TableCell>
											<InvoiceExpiryAt date={invoice.expiryAt} />
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<div className="px-6">
							<div className="flex gap-3">
								<span className="text-muted-foreground">مبلغ مجموع:</span>
								<div>
									{isLoadingInvoices ? (
										<Loading size="xs" />
									) : (
										<>
											<span className="tracking-wide" dir="ltr">
												{toCurrency(invoicesTotal.toString())}
											</span>{" "}
											ریال
										</>
									)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نوع پرداخت</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							paymentType[task.data[ids.paymentType] as PaymentType]?.title
						}
					/>
				</FormControl>
			</FormItem>

			{task.data[ids.paymentType] === PaymentType.BankDeposit && (
				<>
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>حساب بانکی</FormLabel>
						<FormControl>
							<Input
								disabled
								value={
									bankAccountOptions.find(
										(x) => x.value === task.data[ids.bankAccount],
									)?.label
								}
							/>
						</FormControl>
					</FormItem>

					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>شماره رسید واریزی</FormLabel>
						<FormControl>
							<Input
								className="rtl:text-right"
								dir="ltr"
								disabled
								value={task.data[ids.receiptNo]}
							/>
						</FormControl>
					</FormItem>
				</>
			)}

			{task.data[ids.paymentType] === PaymentType.ForeignAccount && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>حساب ارزی</FormLabel>
					<FormControl>
						<Input
							disabled
							value={
								foreignAccountOptions.find(
									(x) => x.value === task.data[ids.foreignAccount],
								)?.label
							}
						/>
					</FormControl>
				</FormItem>
			)}

			{invoicesTotal !== Number(task.data[ids.paymentAmount]) && (
				<div className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<DestructiveAlert>
						<AlertDescription>
							مبلغ مجموع فاکتورها با مبلغ پرداختی دارای مغایرت است و مبلغ
							پرداختی{" "}
							{toCurrency(
								Math.abs(
									Number(task.data[ids.paymentAmount]) - invoicesTotal,
								).toString(),
							)}{" "}
							ریال{" "}
							{Number(task.data[ids.paymentAmount]) > invoicesTotal
								? "بیشتر"
								: "کمتر"}{" "}
							است.
						</AlertDescription>
					</DestructiveAlert>
				</div>
			)}

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مبلغ پرداختی</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={toCurrency(task.data[ids.paymentAmount])}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>تاریخ پرداخت</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.paymentDate]}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>شماره سند</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.voucherNo]}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full">
				<FormLabel>توضیحات</FormLabel>
				<FormControl>
					<Textarea
						className="min-h-48"
						disabled
						value={task.data[ids.informationReviewNote]}
					/>
				</FormControl>
				<FormMessage />
			</FormItem>
		</div>
	);
}

const PhaseEntry: TaskDetailsReturn<FormData> = {
	schema,
	render: <PhasePage />,
};

export default PhaseEntry;
