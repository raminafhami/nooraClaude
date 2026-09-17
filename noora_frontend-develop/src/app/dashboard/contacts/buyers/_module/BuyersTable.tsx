"use client";

import { ReactNode } from "react";

import { Buyer } from "@/buyers/models/Buyer";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { BuyersTableRow } from "./BuyersTableRow";

function BuyersTable({
	buyers,
	loading,
	offset,
	pagination,
}: {
	buyers: Buyer[];
	loading: boolean;
	offset: number;
	pagination: ReactNode;
}) {
	return (
		<Table
			loading={loading}
			pagination={pagination}
			slotProps={{
				root: { className: "border-x-0 rounded-none" },
			}}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-16">#</TableHead>
					<TableHead>نام</TableHead>
					<TableHead className="w-32">نوع</TableHead>
					<TableHead className="w-36">شناسه / کد ملی</TableHead>
					<TableHead className="w-36">شماره تماس</TableHead>
					<TableHead className="w-56">پست الکترونیک</TableHead>
					<TableHead className="w-36">کد پستی</TableHead>
					<TableHead className="w-[32rem]">آدرس</TableHead>
					<TableHead className="w-1">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{buyers.length ? (
					buyers.map((buyer, index) => (
						<BuyersTableRow
							key={buyer.id}
							buyer={buyer}
							index={offset + index + 1}
						/>
					))
				) : (
					<TableRow>
						<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export { BuyersTable };
