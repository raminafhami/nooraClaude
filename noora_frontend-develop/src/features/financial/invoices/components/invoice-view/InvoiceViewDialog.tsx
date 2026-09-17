"use client";

import { useCallback } from "react";

import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { incomeUnit } from "@/financial/incomes/enums/IncomeUnit";
import { toCurrency } from "@/utils/String";

import { invoiceType } from "../../enums/InvoiceType";
import { Invoice } from "../../models/Invoice";

function InvoiceViewDialog({
	payload,
	open,
	onClose,
}: {
	payload: { invoice: Invoice };
	open: boolean;
	onClose: (result?: Invoice) => void;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<InvoiceCreateForm {...payload} />
			</Conditional>
		</Dialog>
	);
}

function InvoiceCreateForm({ invoice }: { invoice: Invoice }) {
	const incomesTotal =
		invoice.items?.reduce((acc, curr) => (acc += curr.total), 0) || 0;

	return (
		<>
			<DialogContent className="max-w-screen-lg">
				<DialogHeader>
					<DialogTitle>
						مشاهده فاکتور{" "}
						<span className="tracking-wide">{invoice.invoiceNo}</span>
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-12 gap-6">
					<div className="col-span-full space-y-2">
						<div className="text-muted-foreground">عنوان</div>
						<div>{invoice.title}</div>
					</div>

					<div className="col-span-full flex items-center gap-3">
						<span>مشخصات گیرنده</span>
						<Separator className="h-1 w-auto grow rounded" />
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">نام</div>
						<div>{invoice.recipient.name}</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">نام خانوادگی</div>
						<div>{invoice.recipient.lastname || "-"}</div>
					</div>

					<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">شناسه/شماره ملی</div>
						<div className="tracking-wide">
							{invoice.recipient.nationalCode?.trim() || "-"}
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">شماره اقتصادی</div>
						<div className="tracking-wide">
							{invoice.recipient.economicCode?.trim() || "-"}
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">شماره ثبت</div>
						<div className="tracking-wide">
							{invoice.recipient.registrationNo?.trim() || "-"}
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">کد پستی</div>
						<div className="tracking-wide">
							{invoice.recipient.postalCode?.trim() || "-"}
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">تلفن</div>
						<div className="tracking-wide">
							{invoice.recipient.phone?.trim() || "-"}
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">فکس</div>
						<div className="tracking-wide">
							{invoice.recipient.fax?.trim() || "-"}
						</div>
					</div>

					<div className="col-span-full space-y-2">
						<div className="text-muted-foreground">آدرس</div>
						<div>{invoice.recipient.address?.trim() || "-"}</div>
					</div>

					<div className="col-span-full flex items-center gap-3">
						<span>مشخصات کالا یا خدمات مورد معامله</span>
						<Separator className="h-1 w-auto grow rounded" />
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">نوع</div>
						<div>{invoiceType[invoice.type]?.title}</div>
					</div>

					<div className="col-span-full -mx-6">
						<Table
							slotProps={{
								root: { className: "rounded-none border-x-0" },
							}}
						>
							<TableHeader>
								<TableRow className="whitespace-nowrap">
									<TableHead className="w-12">#</TableHead>
									<TableHead className="w-20">شماره پرونده</TableHead>
									<TableHead>شرح کالا / خدمت</TableHead>
									<TableHead className="w-28">تعداد / مقدار</TableHead>
									<TableHead className="w-28">واحد</TableHead>
									<TableHead className="w-40">مبلغ واحد</TableHead>
									<TableHead className="w-40">مبلغ کل</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoice.items?.map((income, index) => (
									<TableRow key={income.id} className="whitespace-nowrap">
										<TableCell className="tracking-wide">{index + 1}</TableCell>
										<TableCell className="tracking-wide">
											{income.caseNo}
										</TableCell>
										<TableCell>{income.title}</TableCell>
										<TableCell className="tracking-wide">
											{income.quantity}
										</TableCell>
										<TableCell>{incomeUnit[income.unit]?.title}</TableCell>
										<TableCell className="tracking-wide">
											{toCurrency(
												(income.amount * income.currencyRate).toString(),
											)}
										</TableCell>
										<TableCell className="tracking-wide">
											{toCurrency(income.total.toString())}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">جمع کل</div>
						<div className="tracking-wide">
							{toCurrency(incomesTotal.toString())} ریال
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">مالیات و عوارض</div>
						<div className="tracking-wide">
							{toCurrency((invoice.tax || 0).toString())} ریال
						</div>
					</div>

					<div className="col-span-full space-y-2 sm:col-span-6 md:col-span-4">
						<div className="text-muted-foreground">مبلغ قابل پرداخت</div>
						<div className="tracking-wide">
							{toCurrency((invoice.total + invoice.tax).toString())} ریال
						</div>
					</div>

					<div className="col-span-full">
						<Separator className="h-1 w-auto grow rounded" />
					</div>

					<div className="col-span-full space-y-2">
						<div className="text-muted-foreground">توضیحات</div>
						<div className="tracking-wide">{invoice.description || "-"}</div>
					</div>
				</div>
			</DialogContent>
		</>
	);
}

export { InvoiceViewDialog };
