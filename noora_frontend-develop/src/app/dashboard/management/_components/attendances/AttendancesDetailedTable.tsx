"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";

import { Limitations } from "@/app/dashboard/hr-management/schedules/addLimitations/AddLimitations";
import { Attendance } from "@/hrm/attendance/models/Attendance";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { getAttendancesInDetail } from "@/hrm/attendance/services/getAttendancesInDetail";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { AttendancesQuery } from "./Reports";

interface Props {
	query: AttendancesQuery;
}

export function AttendancesDetailedTable({ query }: Props): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(false);
	const [attendances, setAttendances] = useState<Attendance[] | null>(null);
	const [limitations, setLimitations] = useState<Limitations>();
	useEffect(() => {
		(async () => {
			setAttendances(null);
			setLoading(true);

			const attendances = await getAttendancesInDetail(
				query.personnel!.at(0)!.userId,
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

	async function fetchPersonnel(): Promise<Personnel> {
		const user = await getPersonnelById(query.personnel!.at(0)!.userId, [
			"user",
		]);
		return user;
	}

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const personnel = await fetchPersonnel();
				setLimitations({
					maxDayLeave: personnel.maxDayLeave,
					maxExtraTime: personnel.maxExtraTime,
					maxManualTime: personnel.maxManualTime,
				});
			} catch {
			} finally {
				setLoading(false);
			}
		})();
	}, []);
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
								{attendances.map((attendance, index) => (
									<Table.Row key={attendance.id}>
										<Table.Cell className="text-center">{index + 1}</Table.Cell>
										<Table.Cell>
											<div className="flex gap-x-2">
												<span className="shrink-0 basis-12">
													{moment(attendance.date, "YYYY-MM-DD")
														.locale("fa")
														.format("dddd")}
												</span>
												<span>
													{moment(attendance.date, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}
												</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.totalTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.missTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.extraTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(attendance.missionTime, false)}
										</Table.Cell>
									</Table.Row>
								))}
								<Table.Row key="footer">
									<Table.Cell className="relative py-0" colSpan={100}>
										<div className="relative top-4 flex w-full grid-cols-12 justify-between gap-x-6 rounded-xl bg-gray-100 px-12 transition group-hover:bg-gray-200">
											<div>
												<div className="col-span-3 flex py-4">
													<div>حداکثر اضافه کاری قانونی در روز:</div>
													<div className="ms-3">
														{limitations?.maxExtraTime
															? getTimeString(limitations.maxExtraTime, false)
															: "00:00"}
													</div>
												</div>
											</div>

											<div className="">
												<div className="col-span-3 flex py-4">
													<div>حداکثر مرخصی در ماه:</div>
													<div className="ms-3">
														{limitations?.maxDayLeave} بار
													</div>
												</div>
											</div>
											<div className="">
												<div className="col-span-3 flex py-4">
													<div>حداکثر ورود و خروج دستی در ماه:</div>
													<div className="ms-3">
														{limitations?.maxManualTime} بار
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
		</>
	);
}
