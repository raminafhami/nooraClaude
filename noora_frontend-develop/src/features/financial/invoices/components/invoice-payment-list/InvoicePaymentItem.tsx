"use client";

import { useCallback } from "react";
import { FaFolderOpen } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toCurrency } from "@/utils/String";

import {
	PaymentType,
	paymentType,
} from "../../flows/invoice-payment/enums/PaymentType";
import { InvoiceItem } from "../../flows/invoice-payment/models/InvoiceItem";
import { LedgerAccount } from "../../flows/invoice-payment/models/LedgerAccount";
import { getLedgerAccountByCode } from "../../flows/invoice-payment/utils/getLedgerAccountByCode";
import { InvoicePaymentItemFilesDialog } from "./InvoicePaymentItemFilesDialog";
import { InvoicePaymentItemType } from "./InvoicePaymentList.types";

function InvoicePaymentItem({
	item: { instance, invoices },
	index,
	offset,
}: {
	item: InvoicePaymentItemType;
	index: number;
	offset: number;
}) {
	const dialogs = useDialogs();

	// data
	const ledgerCode =
		instance.parameters["PaymentType"] === PaymentType.BankDeposit
			? instance.parameters["BankAccount"]
			: instance.parameters["PaymentType"] === PaymentType.ForeignAccount
				? instance.parameters["ForeignAccount"]
				: undefined;

	const ledgerAccount: LedgerAccount | undefined = ledgerCode
		? getLedgerAccountByCode(ledgerCode)
		: undefined;

	const caseNos: string = instance.parameters["InvoiceItems"]
		.flatMap((x: InvoiceItem) => x.caseNos)
		.sort()
		.join("، ");

	const issueNos: string = invoices
		.map((x) => x.issueNo)
		.sort()
		.join("، ");

	const recipients = Array.from(
		new Set(
			invoices.map((x) =>
				((x.recipient.name ?? "") + " " + (x.recipient.lastname ?? "")).trim(),
			),
		),
	).join("، ");

	// dialogs
	const handleFilesDialogOpen = useCallback(async () => {
		await dialogs.open(InvoicePaymentItemFilesDialog, instance.id);
	}, [dialogs, instance.id]);

	return (
		<TooltipProvider>
			<TableRow className="whitespace-nowrap">
				<TableCell>
					<Numeric value={offset + index + 1} />
				</TableCell>

				<TableCell>{instance.parameters["Assignees"]?.creator?.name}</TableCell>

				<TableCell>
					<div className="min-w-44 whitespace-normal">{recipients}</div>
				</TableCell>

				<TableCell>
					<div className="flex flex-col gap-1">
						{instance.parameters["PaymentType"] && (
							<div>
								{
									paymentType[instance.parameters["PaymentType"] as PaymentType]
										.title
								}
							</div>
						)}
						{ledgerAccount && <div>{ledgerAccount?.title}</div>}
						{instance.parameters["ReceiptNo"] && (
							<div className="text-xs text-muted-foreground">
								شماره پیگیری:{" "}
								<Numeric value={instance.parameters["ReceiptNo"]} />
							</div>
						)}
					</div>
				</TableCell>

				<TableCell>{instance.parameters["PaymentDate"]}</TableCell>

				<TableCell>
					{instance.parameters["PaymentAmount"] ? (
						<Numeric value={toCurrency(instance.parameters["PaymentAmount"])} />
					) : (
						"-"
					)}
				</TableCell>

				<TableCell>
					{caseNos ? (
						<div className="flex">
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="max-w-48 truncate leading-6">
										<Numeric dir="rtl" value={caseNos} />
									</div>
								</TooltipTrigger>
								<TooltipContent className="max-w-64 leading-5">
									<Numeric
										className="whitespace-normal"
										dir="rtl"
										value={caseNos}
									/>
								</TooltipContent>
							</Tooltip>
						</div>
					) : (
						"-"
					)}
				</TableCell>

				<TableCell>
					<div className="flex">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="max-w-48 truncate leading-6">
									<Numeric dir="rtl" value={issueNos} />
								</div>
							</TooltipTrigger>
							<TooltipContent className="max-w-64 leading-5">
								<Numeric
									className="whitespace-normal"
									dir="rtl"
									value={issueNos}
								/>
							</TooltipContent>
						</Tooltip>
					</div>
				</TableCell>

				<TableCell>
					<Numeric value={instance.parameters["VoucherNo"]} placeholder="-" />
				</TableCell>

				<TableCell>
					{instance.parameters["InformationFormStatus"] === "auto-document"
						? "اتوماتیک"
						: "حسابداری"}
				</TableCell>

				<TableCell>
					<DateTime date={instance.updateAt} />
				</TableCell>

				<TableCell>
					<TooltipProvider>
						<TableActions>
							{/* <TableAction>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											className="focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
											size="icon"
											variant="link"
										>
											<FaEye />
										</Button>
									</TooltipTrigger>
									<TooltipContent>مشاهده درخواست</TooltipContent>
								</Tooltip>
							</TableAction> */}

							<TableAction>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											className="size-all"
											size="icon"
											variant="link"
											onClick={handleFilesDialogOpen}
										>
											<FaFolderOpen />
										</Button>
									</TooltipTrigger>
									<TooltipContent>مدارک درخواست</TooltipContent>
								</Tooltip>
							</TableAction>
						</TableActions>
					</TooltipProvider>
				</TableCell>
			</TableRow>
		</TooltipProvider>
	);
}

export { InvoicePaymentItem };
