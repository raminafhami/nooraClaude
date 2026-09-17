"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import SchedulesWidget from "./SchedulesWidget";

export type WidgetMode =
	| "onePersonnel"
	| "multiPersonnel"
	| "changeLimitations";

export function Schedules() {
	const [mode, setMode] = useState<WidgetMode>("multiPersonnel");

	return (
		<>
			<div className="flex w-fit gap-x-2 overflow-hidden rounded-xl bg-gray-200">
				<div
					className={cn(
						"cursor-pointer px-3 py-1 transition",
						mode === "multiPersonnel" && "bg-gray-400 text-white",
					)}
					onClick={() => {
						setMode("multiPersonnel");
					}}
				>
					ایجاد شیفت‌ کاری چند پرسنل
				</div>

				<div
					className={cn(
						"cursor-pointer px-3 py-1 transition",
						mode === "onePersonnel" && "bg-gray-400 text-white",
					)}
					onClick={() => {
						setMode("onePersonnel");
					}}
				>
					مشاهده و تغییر شیفت کاری یک پرسنل
				</div>
				<div
					className={cn(
						"cursor-pointer px-3 py-1 transition",
						mode === "changeLimitations" && "bg-gray-400 text-white",
					)}
					onClick={() => {
						setMode("changeLimitations");
					}}
				>
					تعیین محدودیت‌ها
				</div>
			</div>

			<SchedulesWidget mode={mode} />
		</>
	);
}
