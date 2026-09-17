import moment from "jalali-moment";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Property } from "../../models/Property";

const RepairHistoryTable = ({
	items,
}: {
	items: Property["repairHistory"];
}) => {
	return (
		<Card className="border px-0 shadow-sm">
			<CardHeader className="px-0">
				<CardTitle className="px-5">تاریخچه تعمیرات</CardTitle>
				<CardContent className="px-0">
					<Table
						slotProps={{
							root: { className: "w-full rounded-none border-x-0" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1">#</TableHead>
								<TableHead className="w-36">نوع تعمیر</TableHead>
								<TableHead className="w-36">توضیحات</TableHead>
								<TableHead className="w-36">هزینه تعمیر</TableHead>
								<TableHead className="w-36">تاریخ تعمیر</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items?.map((item, index) => (
								<TableRow key={index}>
									<TableCell>{index + 1}</TableCell>

									<TableCell>{item.type}</TableCell>
									<TableCell>{item.description}</TableCell>
									<TableCell>{item.cost}</TableCell>
									<TableCell>
										{item.date && moment(item.date).format("jYYYY/jMM/jDD")}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</CardHeader>
		</Card>
	);
};

export { RepairHistoryTable };
