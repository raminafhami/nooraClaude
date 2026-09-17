"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { FaClock, FaRightFromBracket, FaRightToBracket } from "react-icons/fa6";

import chartAImg from "@/assets/images/shapes/chart.svg";
import { Button } from "@/components/ui/button";
import { useAttendanceContext } from "@/hrm/attendance/hooks/useAttendanceContext";
import {
  AttendanceEntryType,
  attendanceEntryType,
} from "@/hrm/attendance/models/AttendanceEntryType";
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { sumTimeString } from "@/time/sumTimeString";
import { Card } from "@/ui/Card";
import { Loading } from "@/ui/Loader";

import { AttendanceWeekReport } from "./AttendanceWeekReport";

// import PersonnelLeaveRequests from "./PersonnelLeaveRequests";

export function AttendanceInformation(): React.ReactNode {
	const [isSending, setSending] = useState<boolean>(false);

	const {
		addEntry,
		entries,
		isLoading,
		state,
		totalTime,
		workshift,
		missTime,
		extraTime,
	} = useAttendanceContext();

	const handleEntryAdd = useCallback(async () => {
		setSending(true);
		await addEntry();
		setSending(false);
	}, [addEntry]);

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-y-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-6">
				<Card
					className="col-span-full col-start-1 md:col-span-1 md:ml-4 lg:col-span-3"
					height="sm"
					intent="primary"
				>
					<div className="flex h-full items-center gap-x-6">
						<div>
							<Image src={chartAImg} alt={""} />
						</div>
						<div className="space-y-2">
							<div className="text-primary-100">مجموع روز</div>
							<div className="text-base font-bold">
								{getTimeString(totalTime)}
							</div>
						</div>
					</div>
				</Card>

				<div className="col-span-full self-center md:col-span-1 lg:col-span-3">
					<AttendanceWeekReport />
				</div>

				<Card
					className="col-span-6 col-start-1 grid h-auto grid-cols-1 overflow-hidden lg:grid-cols-9 lg:gap-x-3"
					height="xl"
					padding="md"
				>
					<Card className="col-span-3 flex w-full flex-col items-center justify-center gap-y-10">
						<div className="flex w-full flex-col items-center gap-y-4">
							<div>شیفت کاری امروز</div>
							<div className="flex w-full flex-col items-center">
								{workshift ? (
									<>
										<div className="flex w-full items-center gap-x-2 self-stretch rounded-xl bg-white px-4 py-2">
											<FaClock />
											<span>شروع:</span>
											<span className="ms-auto">{`${getTimeString(
												workshift.entryTime,
												false,
											)}${
												workshift.flexible !== "00:00:00"
													? ` - ${sumTimeString(
															workshift.entryTime,
															workshift.flexible,
															false,
														)}`
													: ""
											}`}</span>
										</div>
										<div className="ms-5 h-2 w-2 place-self-start bg-gray-300"></div>
										<div className="flex items-center gap-x-2 self-stretch rounded-xl bg-white px-4 py-2">
											<FaClock />
											<span>پایان:</span>
											<span className="ms-auto">{`${getTimeString(
												workshift.exitTime,
												false,
											)}${
												workshift.flexible !== "00:00:00"
													? ` - ${sumTimeString(
															workshift.exitTime,
															workshift.flexible,
															false,
														)}`
													: ""
											}`}</span>
										</div>
									</>
								) : (
									"-"
								)}
							</div>
						</div>

						<div className="w-full">
							{!state || state === AttendanceEntryType.ClockOut ? (
								<Button
									className="flex w-full items-center justify-center gap-x-2"
									disabled={isSending}
									type="button"
									onClick={() => {
										handleEntryAdd();
									}}
								>
									{isSending ? (
										<Loading
											horizontalPlacement="center"
											intent="white"
											size="sm"
										/>
									) : (
										<>
											<FaRightToBracket />
											<span>ورود</span>
										</>
									)}
								</Button>
							) : (
								<Button
									className="flex w-full items-center justify-center gap-x-2"
									disabled={isSending}
									type="button"
									onClick={() => {
										handleEntryAdd();
									}}
								>
									{isSending ? (
										<Loading
											horizontalPlacement="center"
											intent="white"
											size="sm"
										/>
									) : (
										<>
											<FaRightFromBracket />
											<span>خروج</span>
										</>
									)}
								</Button>
							)}
						</div>
					</Card>

					<Card className="lg:col-span-6" intent="white" height="full">
						<div className="flex flex-col gap-y-3 overflow-auto">
							<div className="px-4">ورود و خروج های امروز</div>
							<div className="grid grow grid-cols-4 content-start gap-y-2 overflow-auto px-4 pb-3">
								{entries.map((entry, i) => (
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
								))}
							</div>
							{entries[entries.length - 1]?.type ===
								AttendanceEntryType.ClockOut && (
								<div className="relative w-full shrink-0 basis-10">
									<div className="relative z-10 mx-4 flex h-full items-center gap-x-4">
										<>
											<div className="flex w-full flex-col items-center justify-center gap-x-2 rounded-2xl bg-gray-300 px-6 py-1">
												<span className="w-fit">اضافه کاری:</span>
												<span>{getTimeString(extraTime, false)}</span>
											</div>
											<div className="flex w-full flex-col items-center justify-center gap-x-2 rounded-2xl bg-gray-300 px-6 py-1">
												<span className="w-fit">کسری کار:</span>
												<span>{getTimeString(missTime, false)}</span>
											</div>
										</>
									</div>
									<div className="absolute top-3 h-4 w-full rounded-2xl bg-gray-100"></div>
								</div>
							)}
						</div>
					</Card>
				</Card>

				{/* <PersonnelLeaveRequests /> */}
			</div>
		</>
	);
}
