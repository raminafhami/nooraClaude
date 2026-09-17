"use client";

import React, { useEffect, useState } from "react";
import { FaHourglass } from "react-icons/fa6";

import { cn } from "@/lib/utils";

interface DeadlineProgressBarProps {
	className?: string;
	timeStarted: number;
	deadLine: number;
	colors: (percentageRemaining: number) => {
		bgColor: string;
		progressColor: string;
		textColor: string;
	};
}

function DeadlineProgressBar({
	className,
	timeStarted,
	deadLine,
	colors,
}: DeadlineProgressBarProps) {
	const [timeRemaining, setTimeRemaining] = useState(() => {
		const remaining = deadLine - Date.now();
		return remaining > 0 ? remaining : 0;
	});

	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = deadLine - Date.now();
			setTimeRemaining(remaining > 0 ? remaining : 0);
		}, 1000);

		return () => clearInterval(interval);
	}, [deadLine]);

	const fullDuration = deadLine - timeStarted;
	const percentageRemaining =
		fullDuration > 0 ? (timeRemaining / fullDuration) * 100 : 0;
	const roundedPercentage = Math.floor(percentageRemaining);

	const { bgColor, progressColor, textColor } = colors(percentageRemaining);

	return (
		<div className={cn("flex flex-col items-end justify-end", className)}>
			<div className={`me-1 flex items-center gap-x-1 text-xs ${textColor}`}>
				<span>{roundedPercentage}%</span>
				<FaHourglass />
			</div>
			<div
				className={`relative flex h-2 w-full items-end justify-end rounded-xl ${bgColor}`}
			>
				<div
					className={`${progressColor} h-2 rounded-xl`}
					style={{ width: `${roundedPercentage}%` }}
				></div>
			</div>
		</div>
	);
}

export { DeadlineProgressBar };
