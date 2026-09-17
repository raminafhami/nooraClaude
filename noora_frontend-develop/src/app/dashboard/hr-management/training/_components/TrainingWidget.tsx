"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { TrainingExpertises } from "./TrainingExpertises/TrainingExpertises";
import { TrainingPersonnel } from "./TrainingPersonnel/TrainingPersonnel";

type WidgetMode = "expertise" | "personnel";

export function TrainingWidget(): React.ReactNode {
	const [mode, setMode] = useState<WidgetMode>("personnel");

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-x-6">
				<div className="text-base">آموزش</div>

				<div className="flex gap-x-2 overflow-hidden rounded-xl bg-gray-200 md:w-fit">
					<div
						className={cn(
							"cursor-pointer px-3 py-1 transition",
							mode === "personnel" && "bg-gray-400 text-white",
						)}
						onClick={() => {
							setMode("personnel");
						}}
					>
						نمایش برحسب پرسنل
					</div>

					<div
						className={cn(
							"cursor-pointer px-3 py-1 transition",
							mode === "expertise" && "bg-gray-400 text-white",
						)}
						onClick={() => {
							setMode("expertise");
						}}
					>
						نمایش برحسب توانمندی
					</div>
				</div>
			</div>
			{mode === "personnel" ? <TrainingPersonnel /> : <TrainingExpertises />}
		</div>
	);
}
