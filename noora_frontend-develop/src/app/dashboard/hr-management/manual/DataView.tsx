"use client";

import { memo } from "react";
import { FaClock } from "react-icons/fa6";

import { Attendance } from "@/hrm/attendance/models/Attendance";
import {
  AttendanceEntryType,
  attendanceEntryType,
} from "@/hrm/attendance/models/AttendanceEntryType";
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { sumTimeString } from "@/time/sumTimeString";
import { Card } from "@/ui/Card";

interface Props {
	attendance?: Attendance;
}

export const AttendanceManualDataView = memo(function AttendanceManualDataView({
	attendance,
}: Props) {
	if (!attendance) {
		return <div>اطلاعاتی یافت نشد.</div>;
	}

	return (
		<>
			<Card
				className="col-span-6 col-start-1 grid h-auto grid-cols-1 overflow-hidden lg:grid-cols-9 lg:gap-x-3"
				height="xl"
				padding="md"
			>
				<Card className="col-span-3 flex w-full flex-col items-center justify-center gap-y-10">
					<div className="flex w-full flex-col items-start gap-y-4">
						<div className="flex items-center gap-x-2">
							<span>شیفت کاری</span>
							{!attendance.workshift && (
								<span className="rounded-xl bg-red-500 px-2 py-0.5 text-xs text-white">
									عدم وجود شیفت
								</span>
							)}
						</div>
						<div className="flex w-full flex-col items-center">
							<div className="flex w-full items-center gap-x-2 self-stretch rounded-xl bg-white px-4 py-2">
								<FaClock />
								<span>شروع:</span>
								<span className="ms-auto">
									{attendance.workshift
										? `${getTimeString(attendance.workshift.entryTime, false)}${
												attendance.workshift.flexible !== "00:00:00"
													? ` - ${sumTimeString(
															attendance.workshift.entryTime,
															attendance.workshift.flexible,
															false,
														)}`
													: ""
											}`
										: "-"}
								</span>
							</div>
							<div className="ms-5 h-2 w-2 place-self-start bg-gray-300"></div>
							<div className="flex items-center gap-x-2 self-stretch rounded-xl bg-white px-4 py-2">
								<FaClock />
								<span>پایان:</span>
								<span className="ms-auto">
									{attendance.workshift
										? `${getTimeString(attendance.workshift.exitTime, false)}${
												attendance.workshift.flexible !== "00:00:00"
													? ` - ${sumTimeString(
															attendance.workshift.exitTime,
															attendance.workshift.flexible,
															false,
														)}`
													: ""
											}`
										: "-"}
								</span>
							</div>
						</div>
					</div>
				</Card>

				<Card className="lg:col-span-6" intent="white" height="full">
					<div className="flex h-full flex-col gap-y-3">
						<div className="px-4">ورود و خروج های امروز</div>
						<div className="grid grow grid-cols-4 content-start gap-y-2 px-4">
							{attendance.entries.length
								? attendance.entries.map((entry, i) => (
										<div
											className={cn(
												"flex h-10 items-center gap-x-2",
												i % 2 === 0 && "col-start-1",
											)}
											key={`${i}:${entry.type}:${entry.time}`}
										>
											<div
												className={cn(
													"h-full w-1 rounded-xl",
													entry.type === AttendanceEntryType.ClockIn
														? "bg-primary-500"
														: "bg-black",
												)}
											></div>
											<div className="flex flex-col gap-x-2 gap-y-1">
												<span className="font-bold">
													{attendanceEntryType[entry.type]}
												</span>
												<span>{getTimeString(entry.time, false)}</span>
											</div>
										</div>
									))
								: "(بدون ورود و خروج)"}
						</div>
					</div>
				</Card>
			</Card>
		</>
	);
});
