import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { Property } from "../../models/Property";

const AssignmentHistoryTable = ({
	items,
}: {
	items: Property["assignmentHistory"];
}) => {
	const assignments = useMemo(() => [...items].reverse(), [items]);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<span className="w-fit shrink-0">تاریخچه تحویل کالا</span>
				<Separator className="h-0.5 w-auto grow" />
			</div>

			<Table
				slotProps={{
					wrapper: { className: "-mx-6" },
					root: { className: "rounded-none border-x-0" },
				}}
			>
				<TableHeader>
					<TableRow>
						<TableHead className="w-1">#</TableHead>
						<TableHead>کاربر</TableHead>
						<TableHead className="w-42">وضعیت تخصیص</TableHead>
						<TableHead className="w-36">تاریخ</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{assignments.map((item, index) => (
						<TableRow key={index}>
							<TableCell>{index + 1}</TableCell>

							<TableCell>
								{asNavigationProp(item.userId).name}{" "}
								{asNavigationProp(item.userId).lastname}
							</TableCell>
							<TableCell>
								{item.action === "ASSIGN" ? "اختصاص" : "حذف اختصاص"}
							</TableCell>
							<TableCell>
								<DateTime date={item.date} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

export { AssignmentHistoryTable };
