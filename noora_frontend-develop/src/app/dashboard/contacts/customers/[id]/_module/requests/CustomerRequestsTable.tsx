import { ReactNode } from "react";

import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Instance } from "@/felo/instances/models/Instance";

import { CustomerRequestsTableRow } from "./CustomerRequestsTableRow";

function CustomerRequestsTable({
	items: instances,
	loading,
	offset,
	pagination,
}: {
	items: Instance[];
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
				<TableRow className="whitespace-nowrap">
					<TableHead className="w-1">#</TableHead>
					<TableHead className="w-24">شماره</TableHead>
					<TableHead>نوع درخواست</TableHead>
					<TableHead className="w-36">وضعیت درخواست</TableHead>
					<TableHead className="w-36">وضعیت پرداخت</TableHead>
					<TableHead className="w-44">زمان شروع</TableHead>
					<TableHead className="w-44">آخرین بروزرسانی</TableHead>
					<TableHead className="w-1">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{instances.map((instance, index) => (
					<CustomerRequestsTableRow
						key={instance.id}
						instance={instance}
						index={offset + index}
					/>
				))}
			</TableBody>
		</Table>
	);
}

export { CustomerRequestsTable };
