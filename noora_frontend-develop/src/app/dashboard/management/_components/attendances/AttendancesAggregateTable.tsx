"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { FaFileExcel } from "react-icons/fa6";
import * as XLSX from "xlsx";

import { AttendanceAggregate } from "@/hrm/attendance/models/AttendanceAggregate";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { getAttendancesInAggregate } from "@/hrm/attendance/services/getAttendancesInAggregate";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { AttendancesQuery } from "./Reports";

interface Props {
	query: AttendancesQuery;
}

export function AttendancesAggregateTable({ query }: Props): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [attendances, setAttendances] = useState<AttendanceAggregate[] | null>(
		null,
	);

	useEffect(() => {
		(async () => {
			setAttendances(null);
			setLoading(true);

			const attendances = await getAttendancesInAggregate(
				moment(query.dateFrom!, "jYYYY/jMM/jDD").format(
					"YYYY-MM-DD",
				) as AttendanceDateString,
				moment(query.dateTo!, "jYYYY/jMM/jDD").format(
					"YYYY-MM-DD",
				) as AttendanceDateString,
			);

			setAttendances(attendances);
			setLoading(false);
		})();
	}, [query]);

	return (
		<>
			<div className="col-span-4">
				{isLoading ? (
					<Loading size="sm">در حال دریافت اطلاعات...</Loading>
				) : attendances ? (
					<Panel.Root>
						<Table.Root>
							<Table.Head>
								<Table.Row className="bg-gray-100 text-right">
									<Table.Cell as="th">
										<Table.Actions as="th">
											<Table.Action
												onClick={() => {
													const data: any[] = attendances.map(
														(attendance, index) => {
															return {
																ردیف: index + 1,
																نام: attendance.personnelName,
																"زمان کل": getTimeString(
																	attendance.totalTime,
																	false,
																),
																"کسری کار": getTimeString(
																	attendance.missTime,
																	false,
																),
																"اضافه کاری": getTimeString(
																	attendance.extraTime,
																	false,
																),
															};
														},
													);

													data.push({});
													data.push({
														ردیف: "",
														نام: `${query.dateFrom} - ${query.dateTo}`,
													});

													const workbook = {
														SheetNames: ["Sheet 1"],
														Sheets: {},
													};
													const worksheet = XLSX.utils.json_to_sheet(data);
													// @ts-ignore
													workbook.Sheets["Sheet 1"] = worksheet;

													XLSX.writeFile(workbook, "Attendances.xlsx");
												}}
											>
												<FaFileExcel />
											</Table.Action>
										</Table.Actions>
									</Table.Cell>
									<Table.Cell as="th" className="w-16">
										ردیف
									</Table.Cell>
									<Table.Cell as="th">نام</Table.Cell>
									<Table.Cell as="th">زمان کل</Table.Cell>
									<Table.Cell as="th">کسری کار</Table.Cell>
									<Table.Cell as="th">اضافه کاری</Table.Cell>
									<Table.Cell as="th">ماموریت</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{attendances.map((attendance, index) => (
									<Table.Row key={attendance.personnelId}>
										<Table.Cell></Table.Cell>
										<Table.Cell className="text-center">{index + 1}</Table.Cell>
										<Table.Cell>{attendance.personnelName}</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.totalTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.missTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.extraTime, false)}
										</Table.Cell>
										<Table.Cell>{getTimeString("00:00:00", false)}</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Panel.Root>
				) : (
					<></>
				)}
			</div>
		</>
	);
}
