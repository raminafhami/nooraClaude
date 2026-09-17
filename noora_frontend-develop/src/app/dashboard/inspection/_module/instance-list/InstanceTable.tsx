"use client";

import { memo } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { InstanceItem } from "./InstanceItem";
import { InstanceItemType } from "./InstanceList.types";

function InstanceTable({
	error,
	items,
	loading,
	offset,
	pagination,
}: {
	error: string | null;
	items: InstanceItemType[];
	loading: boolean;
	offset: number;
	pagination: React.ReactNode;
}) {
	return (
		<Table
			loading={loading}
			pagination={pagination}
			slotProps={{ root: { className: "rounded-none border-x-0" } }}
		>
			<TableHeader>
				<TableRow className="whitespace-nowrap">
					<TableHead className="w-1">#</TableHead>
					<TableHead className="w-36">شماره درخواست</TableHead>
					<TableHead className="w-72">نوع درخواست</TableHead>
					<TableHead className="w-52">وضعیت</TableHead>
					<TableHead>کارهای در حال اجرا</TableHead>
					<TableHead className="w-44">وضعیت پرداخت</TableHead>
					<TableHead className="w-44">شماره قرارداد</TableHead>
					<TableHead className="w-72">اطلاعات تکمیلی</TableHead>
					<TableHead className="w-40">زمان باقی مانده</TableHead>
					<TableHead className="w-36">زمان شروع</TableHead>
					<TableHead className="w-36">آخرین بروزرسانی</TableHead>
					<TableHead className="w-1"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{error ? (
					<TableRow className="whitespace-nowrap">
						<TableCell colSpan={100}>دریافت اطلاعات با خطا روبرو شد.</TableCell>
					</TableRow>
				) : items && items.length !== 0 ? (
					items.map((item, index) => (
						<InstanceItem
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
	);
}

const MemoizedInstanceTable = memo(InstanceTable);

export { MemoizedInstanceTable as InstanceTable };
