"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaTriangleExclamation } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { cancelInvoice } from "@/financial/invoices/services/cancelInvoice";
import { getInvoiceById } from "@/financial/invoices/services/getInvoiceById";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";

import {
	Assignees,
	assigneesTemplate,
	AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { InvoiceItem } from "../../models/InvoiceItem";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Partial<Assignees>>(),
	[ids.informationReviewByAccountantStatus]: z.custom<ReviewStatus>(),
	[ids.informationReviewByAccountantNote]: z.string(),
	[ids.invoiceItems]: z.custom<InvoiceItem[]>(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { control, setValue, watch } = useFormContext<FormData>();

	const {
		[ids.invoiceItems]: invoiceItems,
		[ids.informationReviewByAccountantStatus]: reviewStatus,
	} = watch();

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward;
	const isNegativeStatus = reviewStatus === ReviewStatus.ReturnCreator;

	// invoice
	const invoiceItem = invoiceItems?.at(0);

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
	}, [invoiceItem, setValue]);

	// task submission hooks
	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// set assignee:accountant
				data[ids.assignees][AssigneeType.Accountant] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Accountant,
					assigneeTitle: assigneesTemplate[AssigneeType.Accountant],
					noteContent: data[ids.informationReviewByAccountantNote],
					noteType:
						data[ids.informationReviewByAccountantStatus] ===
						ReviewStatus.ReturnCreator
							? "danger"
							: "info",
				};

				if (
					data[ids.informationReviewByAccountantStatus] === ReviewStatus.Forward
				) {
					try {
						const invoice = data[ids.invoiceItems][0];
						cancelInvoice(invoice.id);
					} catch (err) {
						if (isApiResponse(err)) {
							if (
								isLockedIncomeErrorMessage(err) ||
								isLockedInvoiceErrorMessage(err)
							) {
								throw new Error("امکان انجام این عملیات وجود ندارد.");
							}
						}

						throw err;
					}
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				await setStageOfInstance(
					task.instanceId,
					data[ids.informationReviewByAccountantStatus] ===
						ReviewStatus.ReturnCreator
						? "information-form"
						: "cancellation-applied",
				);
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

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.informationReviewByAccountantStatus}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>وضعیت</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{reviewStatusOptions.map((x) => (
										<SelectItem key={x.value} value={x.value}>
											{x.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: messages.validation.required }}
			/>

			{reviewStatus === ReviewStatus.Forward && (
				<div className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<Alert variant="warn">
						<FaTriangleExclamation />
						<AlertDescription>
							تایید به منزله باطل شدن فاکتور توسط حسابداری در سیستم مالی است و
							فاکتور مورد نظر در سامانه روال نیز لغو می گردد.
						</AlertDescription>
					</Alert>
				</div>
			)}

			<FormField
				control={control}
				name={ids.informationReviewByAccountantNote}
				render={({ field }) => (
					<FormItem className="col-span-full">
						<FormLabel>توضیحات</FormLabel>
						<FormControl>
							<Textarea className="min-h-48" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isNegativeStatus && messages.validation.required }}
			/>
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
