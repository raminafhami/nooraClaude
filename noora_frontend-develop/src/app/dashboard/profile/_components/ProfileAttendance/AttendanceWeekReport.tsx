"use client";

import moment from "jalali-moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

import chartBImg from "@/assets/images/shapes/roundchart.svg";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { getAttendanceGeneralReport } from "@/hrm/attendance/services/getAttendanceGeneralReport";
import { getTimeString } from "@/time/getTimeString";
import { Card } from "@/ui/Card";
import { Loading } from "@/ui/Loader";

export function AttendanceWeekReport(): React.ReactNode {
	const [isError, setError] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [duration, setDuration] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError(false);

				const dateCurrent = moment();
				const dayOfWeek = dateCurrent.jDay();

				const dateStart = dateCurrent.subtract(dayOfWeek, "days");
				const dateEnd = dateStart.clone().add(6, "days");

				const result = await getAttendanceGeneralReport(
					dateStart.format("YYYY-MM-DD") as AttendanceDateString,
					dateEnd.format("YYYY-MM-DD") as AttendanceDateString,
				);
				setDuration(result.totalDuration);
			} catch (err: any) {
				console.error(err?.message);
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<Card className="col-span-3 bg-slate-700" height="sm" padding="md">
			<div className="flex h-full items-center gap-x-6">
				<div className="ms-2">
					<Image src={chartBImg} alt={""} />
				</div>
				<div className="space-y-2">
					<div className="text-gray-200">مجموع هفته</div>
					<div className="h-6 text-base font-bold text-white">
						{isLoading ? (
							<Loading intent="white" size="xs" />
						) : isError || !duration ? (
							<FaExclamationTriangle />
						) : (
							getTimeString(duration, false)
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}
