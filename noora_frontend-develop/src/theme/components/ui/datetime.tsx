import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface DateTimeProps extends ComponentProps<"div"> {
	date: Date | string | undefined;
}

function DateTime({ className, date: d, ...props }: DateTimeProps) {
	if (!d) return null;

	const seperator = "،";

	const weekdayFormat = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
		weekday: "long",
	});

	const timeFormat = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const dateFormat = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
		dateStyle: "long",
	});

	const date = typeof d === "string" ? new Date(d) : d;

	const formattedTime = timeFormat.format(date);
	const formattedWeekday = weekdayFormat.format(date);
	const formattedDate = dateFormat.format(date);

	return (
		<div className={cn("space-y-2 text-xs", className)} {...props}>
			<div>{`${formattedTime}${seperator} ${formattedWeekday}`}</div>
			<div>{`${formattedDate}`}</div>
		</div>
	);
}

export { DateTime };
