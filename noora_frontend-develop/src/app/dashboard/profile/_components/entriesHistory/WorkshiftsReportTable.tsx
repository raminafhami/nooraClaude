"use client";
import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";

import { Limitations } from "@/app/dashboard/hr-management/schedules/addLimitations/AddLimitations";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { AttendanceGeneralReport } from "@/hrm/attendance/models/AttendanceGeneralReport";
import { getAttendanceGeneralReport } from "@/hrm/attendance/services/getAttendanceGeneralReport";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { dateQuery } from "./EntriesHistoryWidget";

interface Props {
	query: dateQuery;
}

function WorkshiftsReportTable({ query }: Props): React.ReactNode {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [aggregateReport, setAggregateReport] =
		useState<AttendanceGeneralReport | null>();
	const [limitations, setLimitations] = useState<Limitations>();

	useEffect(() => {
		(async () => {
			try {
				setError(false);
				setAggregateReport(null);
				setLoading(true);
				const response = await getAttendanceGeneralReport(
					moment(query.dateFrom!, "jYYYY/jMM/jDD").format(
						"YYYY-MM-DD",
					) as AttendanceDateString,
					moment(query.dateTo!, "jYYYY/jMM/jDD").format(
						"YYYY-MM-DD",
					) as AttendanceDateString,
				);
				if (response) setAggregateReport(response);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, [query]);

	const { identity } = useLoggedInUser();

	async function fetchPersonnel(): Promise<Personnel> {
		const user = await getPersonnelById(identity!.id, ["user"]);
		return user;
	}

	useEffect(() => {
		(async () => {
			try {
				setError(false);
				setLoading(true);
				const personnel = await fetchPersonnel();
				setLimitations({
					maxDayLeave: personnel.maxDayLeave,
					maxExtraTime: personnel.maxExtraTime,
					maxManualTime: personnel.maxManualTime,
				});
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="col-span-2 min-h-[15rem] space-y-6">
			<div>
				شیفت کاری
				<span className="font-semibold"> {query.dateFrom} </span>
				تا
				<span className="font-semibold"> {query.dateTo} </span>
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
									<Table.Cell as="th">تاریخ</Table.Cell>
									<Table.Cell as="th"></Table.Cell>
									<Table.Cell as="th">شروع شیفت</Table.Cell>
									<Table.Cell as="th">پایان شیفت</Table.Cell>
									<Table.Cell as="th">شناوری شیفت</Table.Cell>
									<Table.Cell as="th">اضافه کاری قانونی</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{aggregateReport?.data.map((report, index) =>
									report.workshift ? (
										<Table.Row key={`attendance-table-${index}`}>
											<Table.Cell className="text-center">
												{index + 1}
											</Table.Cell>
											<Table.Cell width={5}>
												{moment(report.date, "YYYY-MM-DD")
													.locale("fa")
													.format("dddd")}
											</Table.Cell>
											<Table.Cell>
												{moment(report.date, "YYYY-MM-DD")
													.locale("en")
													.format("jYYYY/jMM/jDD")}
											</Table.Cell>
											<Table.Cell>
												{getTimeString(report.workshift.entryTime, false)}
											</Table.Cell>
											<Table.Cell>
												{getTimeString(report.workshift.exitTime, false)}
											</Table.Cell>
											<Table.Cell>
												{getTimeString(report.workshift.flexible, false)}
											</Table.Cell>
											<Table.Cell>
												{report.workshift?.legalExtra
													? getTimeString(report.workshift.legalExtra, false)
													: "-"}
											</Table.Cell>
										</Table.Row>
									) : (
										<Table.Row key={`attendance-table-${index}`}>
											<Table.Cell className="text-center">{index}</Table.Cell>
											<Table.Cell width={5}>
												{moment(report.date, "YYYY-MM-DD")
													.locale("fa")
													.format("dddd")}
											</Table.Cell>
											<Table.Cell>
												{moment(report.date, "YYYY-MM-DD")
													.locale("en")
													.format("jYYYY/jMM/jDD")}
											</Table.Cell>
											<Table.Cell colSpan={100}></Table.Cell>
										</Table.Row>
									),
								)}
								<Table.Row key="footer">
									<Table.Cell className="relative py-0" colSpan={100}>
										<div className="relative flex w-full grid-cols-12 flex-wrap justify-center gap-x-6 rounded-xl bg-gray-100 px-12 py-2 transition group-hover:bg-gray-200">
											<div>
												<div className="col-span-3 flex py-2">
													<div>حداکثر اضافه کاری قانونی در روز:</div>
													<div className="ms-3">
														{limitations?.maxExtraTime
															? getTimeString(limitations.maxExtraTime, false)
															: "?"}
													</div>
												</div>
											</div>

											<div className="">
												<div className="col-span-3 flex py-2">
													<div>حداکثر مرخصی در ماه:</div>
													<div className="ms-3">
														{limitations?.maxDayLeave
															? limitations?.maxDayLeave
															: "?"}{" "}
														بار
													</div>
												</div>
											</div>
											<div className="">
												<div className="col-span-3 flex py-2">
													<div>حداکثر ورود و خروج دستی در ماه:</div>
													<div className="ms-3">
														{limitations?.maxManualTime
															? limitations?.maxManualTime
															: "?"}{" "}
														بار
													</div>
												</div>
											</div>
										</div>
									</Table.Cell>
								</Table.Row>
							</Table.Body>
						</Table.Root>
					</Panel.Root>
				)}
			</div>
		</div>
	);
}

export default WorkshiftsReportTable;
