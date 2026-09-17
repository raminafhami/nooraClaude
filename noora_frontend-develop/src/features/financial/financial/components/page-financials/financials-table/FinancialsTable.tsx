"use client";

import { memo } from "react";

import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Financial } from "@/financial/financial/models/Financial";

import { FinancialItem } from "./FinancialItem";

function FinancialsTable({
	financials,
	loading,
	isConfidentialUser,
	isPaid,
	onSelect,
	onChange,
}: {
	financials: Financial[];
	loading: boolean;
	isConfidentialUser: boolean;
	isPaid: boolean;
	onSelect: (details: { financial: Financial; force?: boolean }) => void;
	onChange: () => void;
}) {
	return (
		<Table
			loading={loading}
			slotProps={{
				root: { className: "rounded-none border-x-0" },
			}}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-16">#</TableHead>
					<TableHead className="w-36">نوع</TableHead>
					<TableHead className="w-48">عنوان</TableHead>
					<TableHead className="w-52">مبلغ</TableHead>
					<TableHead className="w-52">وضعیت</TableHead>
					<TableHead>توضیحات</TableHead>
					<TableHead className="w-24">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{financials.map((financial, index) => (
					<FinancialItem
						key={financial.item.id}
						financial={financial}
						index={index}
						isConfidentialUser={isConfidentialUser}
						isPaid={isPaid}
						onSelect={onSelect}
						onChange={onChange}
					/>
				))}
			</TableBody>
		</Table>
	);
}

const MemoizedFinancialsTable = memo(FinancialsTable);

export { MemoizedFinancialsTable as FinancialsTable };
