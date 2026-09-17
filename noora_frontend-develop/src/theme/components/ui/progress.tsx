"use client";

import { cva } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";

const progressStyles = cva("relative h-4 w-full overflow-hidden rounded-full", {
	variants: {
		color: {
			default: "bg-gray-100",
			blue: "bg-blue-100",
			green: "bg-teal-100",
			red: "bg-red-100",
		},
	},
	defaultVariants: {
		color: "default",
	},
});

const indicatorStyles = cva("h-full w-full flex-1 transition-all", {
	variants: {
		color: {
			default: "bg-gray-500",
			blue: "bg-blue-500",
			green: "bg-teal-500",
			red: "bg-red-500",
		},
	},
	defaultVariants: {
		color: "default",
	},
});

interface ProgressProps
	extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
	value: number;
	color?: "default" | "blue" | "green" | "red";
}

const Progress = forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	ProgressProps
>(({ className, value, color = "default", ...props }, ref) => (
	<ProgressPrimitive.Root
		ref={ref}
		className={cn(progressStyles({ color }), className)}
		{...props}
	>
		<ProgressPrimitive.Indicator
			className={cn(indicatorStyles({ color }))}
			style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
		/>
	</ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
