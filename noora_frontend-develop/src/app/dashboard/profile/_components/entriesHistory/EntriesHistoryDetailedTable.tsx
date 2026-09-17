import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";

import { Attendance } from "@/hrm/attendance/models/Attendance";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { getAttendanceByDate } from "@/hrm/attendance/services/getAttendanceByDate";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { dateQuery } from "./EntriesHistoryWidget";

interface Props {
	query: dateQuery;
}

function EntriesHistoryDetailedTable({ query }: Props): React.ReactNode {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [detailedReport, setDetailedReport] = useState<Attendance | null>();

	useEffect(() => {
		(async () => {
			try {
				setError(false);
				setDetailedReport(null);
				setLoading(true);
				const date = moment(query.date, "jYYYY/jMM/jDD")
					.locale("en")
					.format("YYYY-MM-DD") as AttendanceDateString;
				const response = await getAttendanceByDate(date);
				if (response) setDetailedReport(response);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, [query]);

	return (
		<div className="col-span-2 min-h-[15rem] space-y-6">
			<div>
				ورود و خروج های
				<span className="font-semibold"> {query.date}</span>
			</div>
			<div>
				{error ? (
					<div>خطایی پیش آمده است</div>
				) : loading ? (
					<Loading size="sm">در حال دریافت اطلاعات...</Loading>
				) : (
					<Panel.Root className="scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg overflow-auto">
						<Table.Root>
							<Table.Head>
								<Table.Row className="bg-gray-100 text-right" key="header">
									<Table.Cell as="th" className="w-16">
										ردیف
									</Table.Cell>
									<Table.Cell as="th">زمان ورود</Table.Cell>
									<Table.Cell as="th">زمان خروج</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{!detailedReport?.entries.length ? (
									<Table.Row key="no-data">
										<Table.Cell colSpan={100}>
											ورود و خروجی ثبت نشده است.
										</Table.Cell>
									</Table.Row>
								) : (
									detailedReport?.entries.map(
										(attendance, index) =>
											!(index % 2) && (
												<Table.Row
													key={`attendance-table-${attendance.type}-${attendance.time}-${index}`}
												>
													<Table.Cell className="text-center">
														{index / 2 + 1}
													</Table.Cell>
													<Table.Cell>
														{getTimeString(attendance.time, false)}
													</Table.Cell>
													<Table.Cell>
														{detailedReport.entries[index + 1]?.time &&
															getTimeString(
																detailedReport.entries[index + 1].time,
																false,
															)}
													</Table.Cell>
												</Table.Row>
											),
									)
								)}

								{detailedReport?.entries && (
									<Table.Row key="footer">
										<Table.Cell className="relative py-0" colSpan={100}>
											<div className="relative my-2 flex w-full grid-cols-12 flex-wrap justify-center gap-x-6 rounded-xl bg-gray-100 px-12 transition group-hover:bg-gray-200">
												<div>
													<div className="col-span-3 flex py-2">
														<div>مجموع:</div>
														<div className="ms-3">
															{getTimeString(detailedReport.totalTime, false)}
														</div>
													</div>
												</div>

												<div className="">
													<div className="col-span-3 flex py-2">
														<div>کسری:</div>
														<div className="ms-3">
															{getTimeString(detailedReport.missTime, false)}
														</div>
													</div>
												</div>
												<div className="">
													<div className="col-span-3 flex py-2">
														<div>اضافه کاری:</div>
														<div className="ms-3">
															{getTimeString(detailedReport.extraTime, false)}
														</div>
													</div>
												</div>
											</div>
										</Table.Cell>
									</Table.Row>
								)}
							</Table.Body>
						</Table.Root>
					</Panel.Root>
				)}
			</div>
		</div>
	);
}

export default EntriesHistoryDetailedTable;
