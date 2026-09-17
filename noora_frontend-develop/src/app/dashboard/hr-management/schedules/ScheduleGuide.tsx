"use client";

import React, { useEffect, useState } from "react";

import { Workshift } from "@/hrm/attendance/models/Workshift";
import { getWorkshifts } from "@/hrm/attendance/services/getWorkshifts";
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { TimeString } from "@/time/TimeString";

import { InitialFormObj, Query } from "./SchedulesWidget";

export function ScheduleGuide({
	colorAndId,
	formData,
}: {
	colorAndId: Query["colorsAndWorkShift"];
	formData: InitialFormObj;
}) {
	const [guides, setGuides] = useState<
		{
			entryTime: TimeString;
			exitTime: TimeString;
			flexible: TimeString;
			name: string;
			colorCode: string;
			title: string;
			legalExtra: TimeString;
		}[]
	>();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [workshifts, setWorkshifts] = useState<Workshift[]>([]);

	const handleWorkshiftsFetch = (workshifts: Workshift[]): void => {
		setWorkshifts(workshifts);
	};

	async function loadWorkshifts() {
		setLoading(true);

		try {
			const workshifts = await getWorkshifts();
			setError(null);
			handleWorkshiftsFetch(workshifts);
		} catch (err: any) {
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadWorkshifts();
	}, []);

	useEffect(() => {
		if (workshifts.length > 0) {
			// check if it's date is empty or not
			// if its empty then don't show it as a guid
			// else if its not empty then show it as a guide
			const notEmptyColorAndId = colorAndId.filter((colorAndShift) => {
				return Object.keys(formData.datesAndWorkShift).find(
					(id) => id === colorAndShift.workShiftId,
				);
			});
			// find ids in colorAndId that matches workingRegulation id
			const matchedColorWithApiRegulation = notEmptyColorAndId.filter(
				(colorAndShift) => {
					return workshifts.find(
						(regulation) => regulation.id === colorAndShift.workShiftId,
					);
				},
			);
			// add start ,end , flexible time to each member of matchedColorWithApiRegulation
			const fullGuideData: any = matchedColorWithApiRegulation.map(
				(colorAndShift) => {
					const matchedRegulation = workshifts.find(
						(regulation) => regulation.id === colorAndShift.workShiftId,
					);
					if (matchedRegulation) {
						return {
							entryTime: matchedRegulation.entryTime,
							exitTime: matchedRegulation.exitTime,
							flexible: matchedRegulation.flexible,
							legalExtra: matchedRegulation.legalExtra,
							name: colorAndShift.name,
							colorCode: colorAndShift.colorCode,
							title: matchedRegulation.title,
						};
					}
				},
			);
			setGuides(fullGuideData);
		}
	}, [colorAndId, formData, workshifts]);

	return (
		<div className="flex h-full w-full flex-col gap-4">
			<div className="font-bold">راهنما:</div>
			<div className="flex w-full flex-wrap gap-x-20 gap-y-5">
				{guides &&
					guides.map((i) => (
						<div
							key={i.colorCode}
							className="flex items-center gap-5 border-b border-primary-100 pb-2"
						>
							<div
								style={{ backgroundColor: i.colorCode }}
								className={cn("min-h-[2rem] min-w-[2rem] rounded-lg")}
							/>
							<div className="flex flex-col gap-1">
								<span className="font-bold"> {i.title}</span>
								<div className="flex w-full gap-3">
									<span>شروع: {getTimeString(i.entryTime, false)}</span>
									<span>پایان: {getTimeString(i.exitTime, false)}</span>
									<span>شناوری: {getTimeString(i.flexible, false)}</span>
									<span>اضافه کاری: {getTimeString(i.legalExtra, false)}</span>
								</div>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
