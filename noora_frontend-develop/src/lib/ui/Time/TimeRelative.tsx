import { formatTimeAgo } from "@/utils";

interface Props {
	time: Date;
}

export function TimeRelative({ time }: Props) {
	return (
		<span
			title={time.toLocaleString(undefined, {
				calendar: "persian",
				dateStyle: "long",
				timeStyle: "medium",
			})}
		>
			{formatTimeAgo(time)}
		</span>
	);
}
