"use client";

import { useMemo } from "react";
import { FaX } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

import { bankAccountOptions } from "../../flows/invoice-payment/data/bankAccounts";
import { foreignAccountOptions } from "../../flows/invoice-payment/data/foreignAccounts";
import { paymentType } from "../../flows/invoice-payment/enums/PaymentType";
import { InvoicePaymentFilterArgs } from "./InvoicePaymentList.types";

function InvoicePaymentFilterBar({
	disabled,
	filterArgs,
	onFilterArgsUpdate,
}: {
	disabled?: boolean;
	filterArgs: InvoicePaymentFilterArgs;
	onFilterArgsUpdate: (filterArgs: InvoicePaymentFilterArgs) => void;
}) {
	const count = useMemo(() => {
		let c = 0;

		for (let key in filterArgs) {
			if (filterArgs[key as keyof InvoicePaymentFilterArgs]) {
				c++;
			}
		}

		return c;
	}, [filterArgs]);

	if (!count) {
		return null;
	}

	function handleFilterRemove(
		filterKey:
			| keyof InvoicePaymentFilterArgs
			| (keyof InvoicePaymentFilterArgs)[],
	) {
		return () => {
			if (disabled) return;

			const nextFilters: InvoicePaymentFilterArgs = { ...filterArgs };

			(Array.isArray(filterKey) ? filterKey : [filterKey]).forEach((key) => {
				nextFilters[key as keyof InvoicePaymentFilterArgs] = undefined;
			});

			onFilterArgsUpdate(nextFilters);
		};
	}

	return (
		<CardContent className="border-t bg-gray-50 pt-6">
			<div className="flex flex-col gap-6 xs:flex-row">
				<div className="leading-7">فیلترهای اعمال شده:</div>
				<div className="flex flex-wrap gap-3 pt-0.5">
					{filterArgs.creator && (
						<FilterItem onRemove={handleFilterRemove("creator")}>
							درخواست دهنده: {filterArgs.creator.name}
						</FilterItem>
					)}

					{filterArgs.caseNo && (
						<FilterItem onRemove={handleFilterRemove("caseNo")}>
							شماره درخواست بازرسی: {filterArgs.caseNo}
						</FilterItem>
					)}

					{filterArgs.paymentType && (
						<FilterItem onRemove={handleFilterRemove("paymentType")}>
							نحوه پرداخت: {paymentType[filterArgs.paymentType].title}
						</FilterItem>
					)}

					{filterArgs.bankAccount && (
						<FilterItem onRemove={handleFilterRemove("bankAccount")}>
							حساب بانکی:{" "}
							{
								bankAccountOptions.find(
									(x) => x.value === filterArgs.bankAccount,
								)?.label
							}
						</FilterItem>
					)}

					{filterArgs.receiptNo && (
						<FilterItem onRemove={handleFilterRemove("receiptNo")}>
							شماره پیگیری: {filterArgs.receiptNo}
						</FilterItem>
					)}

					{filterArgs.foreignAccount && (
						<FilterItem onRemove={handleFilterRemove("foreignAccount")}>
							حساب ارزی:{" "}
							{
								foreignAccountOptions.find(
									(x) => x.value === filterArgs.foreignAccount,
								)?.label
							}
						</FilterItem>
					)}

					{filterArgs.paymentDateFrom && (
						<FilterItem onRemove={handleFilterRemove("paymentDateFrom")}>
							تاریخ پرداخت از: {filterArgs.paymentDateFrom}
						</FilterItem>
					)}

					{filterArgs.paymentDateTo && (
						<FilterItem onRemove={handleFilterRemove("paymentDateTo")}>
							تاریخ پرداخت تا: {filterArgs.paymentDateTo}
						</FilterItem>
					)}

					{filterArgs.voucherNo && (
						<FilterItem onRemove={handleFilterRemove("voucherNo")}>
							شماره سند حسابداری: {filterArgs.voucherNo}
						</FilterItem>
					)}

					{filterArgs.voucherEntryBy && (
						<FilterItem onRemove={handleFilterRemove("voucherEntryBy")}>
							نحوه ثبت سند:{" "}
							{filterArgs.voucherEntryBy === "creator"
								? "اتوماتیک"
								: "حسابداری"}
						</FilterItem>
					)}

					{(filterArgs.dateFrom || filterArgs.dateTo) && (
						<FilterItem onRemove={handleFilterRemove(["dateFrom", "dateTo"])}>
							تاریخ ثبت سند{" "}
							{[
								filterArgs.dateFrom && `از ${filterArgs.dateFrom}`,
								filterArgs.dateTo && `تا ${filterArgs.dateTo}`,
							]
								.filter(Boolean)
								.join(" ")}
						</FilterItem>
					)}

					{count > 1 && (
						<Badge
							className="cursor-pointer bg-red-100 py-1 text-red-900"
							onClick={() => {
								if (disabled) return;

								onFilterArgsUpdate({});
							}}
						>
							حذف همه فیلترها
						</Badge>
					)}
				</div>
			</div>
		</CardContent>
	);
}

function FilterItem({
	children,
	onRemove,
}: React.PropsWithChildren<{
	onRemove: () => void;
}>) {
	return (
		<Badge className="bg-gray-200 py-1 text-gray-900">
			<span>{children}</span>
			<FaX className="cursor-pointer" size={10} onClick={onRemove} />
		</Badge>
	);
}

export { InvoicePaymentFilterBar };
