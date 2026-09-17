"use client";

import { memo } from "react";

import { CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { InvoicePaymentItem } from "./InvoicePaymentItem";
import { InvoicePaymentItemType } from "./InvoicePaymentList.types";

const InvoicePaymentTable = memo(
	({
		error,
		items,
		loading,
		offset,
		pagination,
	}: {
		error: string | null;
		items: InvoicePaymentItemType[];
		loading: boolean;
		offset: number;
		pagination: React.ReactNode;
	}) => {
		return (
			<CardContent className="px-0">
				<Table
					loading={loading}
					pagination={pagination}
					slotProps={{ root: { className: "rounded-none border-x-0" } }}
				>
					<TableHeader>
						<TableRow className="whitespace-nowrap">
							<TableHead className="w-20">#</TableHead>
							<TableHead className="w-56">درخواست دهنده</TableHead>
							<TableHead>گیرنده</TableHead>
							<TableHead className="w-72">نحوه پرداخت</TableHead>
							<TableHead className="w-36">تاریخ پرداخت</TableHead>
							<TableHead className="w-36">مبلغ پرداختی</TableHead>
							<TableHead className="w-56">درخواست ها</TableHead>
							<TableHead className="w-56">فاکتورها</TableHead>
							<TableHead className="w-32">سند حسابداری</TableHead>
							<TableHead className="w-36">نحوه ثبت سند</TableHead>
							<TableHead className="w-36">تاریخ ثبت سند</TableHead>
							<TableHead className="w-28">عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{error ? (
							<TableRow className="whitespace-nowrap">
								<TableCell colSpan={100}>
									دریافت اطلاعات با خطا روبرو شد.
								</TableCell>
							</TableRow>
						) : items && items.length !== 0 ? (
							items.map((item, index) => (
								<InvoicePaymentItem
									key={item.instance.id}
									item={item}
									index={index}
									offset={offset}
								/>
							))
						) : (
							<TableRow className="whitespace-nowrap">
								<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		);
	},
);
InvoicePaymentTable.displayName = "InvoicePaymentTable";

export { InvoicePaymentTable };
