"use client";

import { useEffect, useState } from "react";
import { FaCheckDouble } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInvoiceById } from "@/financial/invoices/services/getInvoiceById";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { toCurrency } from "@/utils/String";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

const schema = z.object({});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	// invoice
	const invoiceItem = task.data[ids.invoiceItems][0];

	const [isLoadingInvoice, setIsLoadingInvoice] = useState<boolean>(true);
	const [invoice, setInvoice] = useState<Invoice>();

	useEffect(() => {
		(async () => {
			if (!invoiceItem) {
				setIsLoadingInvoice(false);
				setInvoice(undefined);
				return;
			}

			try {
				setIsLoadingInvoice(false);

				const invoice = await getInvoiceById(invoiceItem.id).then((invoice) =>
					parseInvoice(invoice),
				);

				setInvoice(invoice);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات فاکتور رخ داد.");
			} finally {
				setIsLoadingInvoice(false);
			}
		})();
	}, [invoiceItem]);

	// task submission hooks
	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<PreviousTaskReferrer />

			<Separator className="col-span-full h-1" />

			<Card className="col-span-full !col-start-1 xl:col-span-10 2xl:col-span-8">
				<CardHeader>
					<CardTitle>فاکتور</CardTitle>
				</CardHeader>
				<CardContent className="px-0">
					<Table
						loading={isLoadingInvoice}
						slotProps={{
							root: { className: "rounded-none border-x-0" },
						}}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
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
							{invoice && (
								<TableRow className="whitespace-nowrap">
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
												{invoice.issuedBy && <div>{invoice.issuedBy.name}</div>}
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
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<div className="col-span-full !col-start-1 xl:col-span-10 2xl:col-span-8">
				<Alert variant="success">
					<FaCheckDouble />
					<AlertDescription>
						فاکتور مورد نظر با موفقیت لغو گردید.
					</AlertDescription>
				</Alert>
			</div>
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
