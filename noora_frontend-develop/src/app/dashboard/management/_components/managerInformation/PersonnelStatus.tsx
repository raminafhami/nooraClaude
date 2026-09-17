import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";

import { Attendance } from "@/hrm/attendance/models/Attendance";
import {
  AttendanceStatus,
  attendanceStatus,
} from "@/hrm/attendance/models/attendanceStatus";
import { getAttendances } from "@/hrm/attendance/services/getAttendances";
import { cn } from "@/lib/utils";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

function PersonnelStatus() {
	const [isError, setError] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [attendances, setAttendances] = useState<Attendance[]>([]);

	useEffect(() => {
		(async () => {
			try {
				setError(false);
				setLoading(true);

				const attendances = await getAttendances({
					filters: {
						date: moment().format("YYYY-MM-DD"),
					},
					populate: ["user"],
				});

				const sortedAttendances = attendances.sort((a, b) => {
					const fullnameA = a.user?.fullname.toLowerCase() ?? "";
					const fullnameB = b.user?.fullname.toLowerCase() ?? "";
					return fullnameA < fullnameB ? -1 : fullnameA > fullnameB ? 1 : 0;
				});

				setAttendances(sortedAttendances);
			} catch (err: any) {
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="max-w-[40rem] grow space-y-8 overflow-hidden">
			<Head.Root>
				<Head.Title>وضعیت پرسنل</Head.Title>
			</Head.Root>

			<div className="h-fit w-full overflow-y-auto">
				<Panel.Root>
					<Table.Root>
						<Table.Head>
							<Table.Row key="header" className="bg-gray-100 text-right">
								<Table.Cell as="th" className="w-16">
									ردیف
								</Table.Cell>
								<Table.Cell as="th">نام</Table.Cell>
								<Table.Cell as="th" className="w-48">
									وضعیت
								</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{isLoading ? (
								<Table.Row key="loading">
									<Table.Cell colSpan={100}>
										<Loading size="sm">در حال دریافت اطلاعات...</Loading>
									</Table.Cell>
								</Table.Row>
							) : isError ? (
								<Table.Row key="error">
									<Table.Cell colSpan={100}>خطایی رخ داده‌است.</Table.Cell>
								</Table.Row>
							) : attendances.length !== 0 ? (
								attendances.map((attendance, index) => {
									const user = attendance.user!;

									return (
										<Table.Row key={user.id}>
											<Table.Cell className="text-center">
												{index + 1}
											</Table.Cell>
											<Table.Cell>{user.fullname}</Table.Cell>
											<Table.Cell>
												<span
													className={cn(
														"rounded-2xl px-2 py-[0.2rem]",
														attendance.status === AttendanceStatus["absence"] &&
															"bg-red-300/10 text-red-600",
														attendance.status ===
															AttendanceStatus["completed"] &&
															"bg-blue-300/10 text-blue-600",
														attendance.status === AttendanceStatus["working"] &&
															"bg-green-300/10 text-green-600",
													)}
												>
													{attendanceStatus[attendance.status]}
												</span>
											</Table.Cell>
										</Table.Row>
									);
								})
							) : (
								<Table.Row key="empty">
									<Table.Cell colSpan={100}>
										پرسنلی برای نمایش وجود ندارد.
									</Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table.Root>
				</Panel.Root>
			</div>
		</div>
	);
}

export default PersonnelStatus;
