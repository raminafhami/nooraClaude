"use client";

import { ActivityType, activityTypes } from "@/activities/enums/ActivityType";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function CustomerActivityCreateButton({
	className,
	type,
	onPress,
}: Omit<React.ComponentPropsWithoutRef<typeof Button>, "type"> & {
	type: ActivityType;
	onPress: (activity: { type: ActivityType }) => void;
}) {
	const Icon = activityTypes[type].icon;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					className={cn(
						"relative rounded-none text-base text-white opacity-80 shadow-none focus-within:opacity-100 hover:opacity-100 hover:shadow-none",
						className,
					)}
					onClick={() => onPress({ type })}
				>
					<Icon />
				</Button>
			</TooltipTrigger>
			<TooltipContent>{`افزودن ${activityTypes[type].title}`}</TooltipContent>
		</Tooltip>
	);
}

export { CustomerActivityCreateButton };
