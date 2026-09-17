"use client";

import moment from "jalali-moment";
import { FaCalendarXmark } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableAction,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { completePropertyMaintenance } from "@/property/services/completePropertyMaintenance";

import { Property } from "../../models/Property";

const MaintenanceHistoryTable = ({
	id,
	items,
	refetch,
	onClose,
}: {
	id: string;
	items: Property["maintenanceHistory"];
	refetch: () => void;
	onClose: () => void;
}) => {
	const handleCompleteMaintenance = async (maintenanceId: string) => {
		try {
			await completePropertyMaintenance(id, maintenanceId);
		} catch (error) {
			console.error("خطا در تکمیل نگهداری:", error);
			toast.error("خطایی در تکمیل نگهداری رخ داد.");
			return;
		}
		toast.success("نگهداری با موفقیت تکمیل شد.");
		refetch();
		onClose();
	};

	return (
		<Card className="border px-0 shadow-sm">
			<CardHeader className="px-0">
				<CardTitle className="px-5">تاریخچه نگهداری</CardTitle>
				<CardContent className="px-0">
					<Table
						slotProps={{
							root: { className: "w-full rounded-none border-x-0" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1">#</TableHead>
								<TableHead className="w-36">نگهدارنده</TableHead>
								<TableHead className="w-36">توضیحات</TableHead>
								<TableHead className="w-36">تاریخ شروع نگهداری</TableHead>
								<TableHead className="w-36">تاریخ پایان نگهداری</TableHead>
								<TableHead className="w-36">هزینه</TableHead>
								<TableHead className="w-24">عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items?.map((item, index) => (
								<TableRow key={item.id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell>{item.technician}</TableCell>
									<TableCell>{item.description}</TableCell>
									<TableCell>
										{item.startDate &&
											moment(item.startDate).format("jYYYY/jMM/jDD")}
									</TableCell>
									<TableCell>
										{item.endDate &&
											moment(item.endDate).format("jYYYY/jMM/jDD")}
									</TableCell>
									<TableCell>{item.cost}</TableCell>
									<TableCell>
										{!item.endDate && (
											<TableAction>
												<Button
													onClick={() => {
														handleCompleteMaintenance(item.id);
													}}
													variant="primary"
												>
													تکمیل نگهداری <FaCalendarXmark />
												</Button>
											</TableAction>
										)}
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

export { MaintenanceHistoryTable };
