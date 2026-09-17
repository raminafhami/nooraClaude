"use client";

import React, { useEffect, useState } from "react";

import { Workshift } from "@/hrm/attendance/models/Workshift";
import { getWorkshifts } from "@/hrm/attendance/services/getWorkshifts";
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";

import { PersonnelSelectionType, Query } from "./SchedulesWidget";

export function SchedulesWorkingShiftList({
	setCalDisabled,
	setColorAndId,
	setCurrentWorkingRegulationId,
	currentWorkingRegulationId,
	mode,
}: {
	mode: PersonnelSelectionType;
	setCalDisabled: React.Dispatch<React.SetStateAction<boolean>>;
	currentWorkingRegulationId: string;
	setColorAndId: Query["setColorAndWorkShiftId"];
	setCurrentWorkingRegulationId: Query["setCurrent"];
}) {
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

	const workingTimeRegulations: {
		entryTime: string;
		exitTime: string;
		flexible: string;
		id: string;
	}[] = [];

	const changeHandler = (id: string) => {
		setCalDisabled(false);
		setColorAndId((prev) => {
			if (prev.length > 0) {
				// check if workingRegulationId already exists:
				// if it exists just change the current to this workingRegulationId
				const index = prev.findIndex((item) => item.workShiftId === id);
				if (index !== -1) {
					// just changing current
					setCurrentWorkingRegulationId((prev) => {
						return id;
					});
				}
				// else if it doesn't exist :
				// find a new empty workingRegulationId and set this to that.
				else {
					const emptyIndex = prev.findIndex((item) => item.workShiftId === "");
					// if there was any empty workingRegulationId:
					if (emptyIndex !== -1) {
						setCurrentWorkingRegulationId((prev) => {
							return id;
						});
						const updatedArray = [...prev];
						updatedArray[emptyIndex] = {
							...updatedArray[emptyIndex],
							workShiftId: id,
						};
						return updatedArray;
					}
				}
			}
			return prev;
		});
	};

	return (
		<div className="flex h-[13.7rem] min-w-full flex-col gap-y-1 overflow-y-hidden rounded-3xl border border-primary-100/60 p-2">
			<div className="font-bold"> شیفت کاری را انتخاب کنید.</div>
			{isLoading ? (
				<Loading />
			) : error ? (
				<div>{error}</div>
			) : (
				<div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-zinc-700 flex max-h-full w-full flex-wrap gap-1 gap-x-8 overflow-y-auto px-2">
					{mode === PersonnelSelectionType["onePersonnel"] && (
						<div
							className={cn(
								"flex w-36 cursor-pointer items-center justify-center px-4 py-2 hover:rounded-2xl hover:bg-primary-200",
								currentWorkingRegulationId === "null"
									? "rounded-2xl bg-primary-600 text-gray-100 hover:bg-primary-600"
									: "",
							)}
							onClick={() => {
								setCalDisabled(false);
								setCurrentWorkingRegulationId("null");
							}}
						>
							حذف شیفت کاری
						</div>
					)}
					{workshifts?.map((workingTimeRegulation, index) => (
						<div
							key={`workingTimeRegulation ${index}`}
							className={cn(
								"flex w-36 cursor-pointer items-center gap-4 px-4 py-2 pl-10 hover:rounded-2xl hover:bg-primary-200",
								currentWorkingRegulationId === workingTimeRegulation.id
									? "rounded-2xl bg-primary-600 text-gray-100 hover:bg-primary-600"
									: "",
							)}
							onClick={() => changeHandler(workingTimeRegulation.id)}
						>
							<div className="flex w-48 items-center justify-center gap-2">
								<div className="text-md flex flex-col">
									<div className="flex w-full font-bold">
										<span>{workingTimeRegulation.title}</span>
									</div>
									<div className="flex w-full justify-between gap-2">
										<span className="w-16">شروع:</span>
										<span>
											{getTimeString(workingTimeRegulation.entryTime, false)}
										</span>
									</div>
									<div className="flex w-full justify-between gap-2">
										<span className="w-16">پایان:</span>
										<span>
											{getTimeString(workingTimeRegulation.exitTime, false)}
										</span>
									</div>
									<div className="flex w-full justify-between gap-2">
										<span className="w-16">شناوری:</span>
										<span>
											{getTimeString(workingTimeRegulation.flexible, false)}
										</span>
									</div>
									<div className="flex w-full justify-between gap-2">
										<span className="w-16">اضافه کاری:</span>
										<span>
											{getTimeString(workingTimeRegulation.legalExtra, false)}
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
					{!workingTimeRegulations && <div>مشکلی پیش آمده است</div>}
				</div>
			)}
		</div>
	);
}
