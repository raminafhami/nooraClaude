"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";

import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { AttendanceGeneralReport } from "@/hrm/attendance/models/AttendanceGeneralReport";
import { getAttendanceGeneralReport } from "@/hrm/attendance/services/getAttendanceGeneralReport";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { dateQuery } from "./EntriesHistoryWidget";

interface Props {
	query: dateQuery;
}

export function EntriesHistoryGeneralTable({ query }: Props): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [generalReport, setGeneralReport] =
		useState<AttendanceGeneralReport | null>(null);
	const [error, setError] = useState(false);
	useEffect(() => {
		(async () => {
			try {
				setGeneralReport(null);
				setLoading(true);
				setError(false);

				const response = await getAttendanceGeneralReport(
					moment(query.dateFrom!, "jYYYY/jMM/jDD").format(
						"YYYY-MM-DD",
					) as AttendanceDateString,
					moment(query.dateTo!, "jYYYY/jMM/jDD").format(
						"YYYY-MM-DD",
					) as AttendanceDateString,
				);

				setGeneralReport(response);
				setLoading(false);
			} catch (e) {
				setGeneralReport(null);
				setLoading(false);
				setError(true);
			}
		})();
	}, [query]);

	return (
		<>
			<div className="col-span-2 space-y-6">
				<div>
					گزارش کلی
					<span className="font-semibold"> {query.dateFrom} </span>
					تا
					<span className="font-semibold"> {query.dateTo} </span>
				</div>
				<div>
					{isLoading ? (
						<Loading size="sm">در حال دریافت اطلاعات...</Loading>
					) : generalReport ? (
						<Panel.Root className="scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg overflow-auto">
							<Table.Root>
								<Table.Head>
									<Table.Row className="bg-gray-100 text-right">
										<Table.Cell as="th" className="w-16">
											ردیف
										</Table.Cell>
										<Table.Cell as="th" className="w-48">
											تاریخ
										</Table.Cell>
										<Table.Cell as="th">زمان کل</Table.Cell>
										<Table.Cell as="th">کسری کار</Table.Cell>
										<Table.Cell as="th">اضافه کاری</Table.Cell>
										<Table.Cell as="th">ماموریت</Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body>
									{error && (
										<Table.Row>
											<Table.Cell colSpan={100}>خطایی پیش آمده است</Table.Cell>
										</Table.Row>
									)}
									{!error &&
										generalReport.data.map((day, index) => (
											<Table.Row key={day.id}>
												<Table.Cell className="text-center">
													{index + 1}
												</Table.Cell>
												<Table.Cell>
													<div className="flex gap-x-2">
														<span className="shrink-0 basis-12">
															{moment(day.date, "YYYY-MM-DD")
																.locale("fa")
																.format("dddd")}
														</span>
														<span>
															{moment(day.date, "YYYY-MM-DD")
																.locale("en")
																.format("jYYYY/jMM/jDD")}
														</span>
													</div>
												</Table.Cell>
												<Table.Cell>
													{getTimeString(day.totalTime, false)}
												</Table.Cell>
												<Table.Cell>
													{getTimeString(day.missTime, false)}
												</Table.Cell>
												<Table.Cell>
													{getTimeString(day.extraTime, false)}
												</Table.Cell>
												<Table.Cell>
													{getTimeString(day.missionTime, false)}
												</Table.Cell>
											</Table.Row>
										))}

									<Table.Row key="footer">
										<Table.Cell className="relative py-0" colSpan={100}>
											<div className="relative my-2 flex w-full grid-cols-12 flex-wrap justify-center gap-x-6 rounded-xl bg-gray-100 px-12 transition group-hover:bg-gray-200">
												<div>
													<div className="col-span-3 flex py-2">
														<div>مجموع:</div>
														<div className="ms-3">
															{getTimeString(
																generalReport.totalDuration,
																false,
															)}
														</div>
													</div>
												</div>

												<div className="">
													<div className="col-span-3 flex py-2">
														<div>مجموعه کسری:</div>
														<div className="ms-3">
															{getTimeString(generalReport.totalMiss, false)}
														</div>
													</div>
												</div>
												<div className="">
													<div className="col-span-3 flex py-2">
														<div>مجموع اضافه کاری:</div>
														<div className="ms-3">
															{getTimeString(generalReport.totalExtra, false)}
														</div>
													</div>
												</div>
											</div>
										</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</Panel.Root>
					) : (
						<></>
					)}
				</div>
			</div>
		</>
	);
}
