import { cva, VariantProps } from "class-variance-authority";
import React from "react";
import { IconType } from "react-icons";
import { FaExclamationTriangle } from "react-icons/fa";

import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const variants = cva("h-full", {
	variants: {
		color: {
			blue: "",
			purple: "",
			red: "",
			cyan: "",
		},
		bgColor: {
			blue: "border-x-0 !border-transparent bg-gradient-to-r from-blue-300 to-blue-500",
			purple:
				"border-x-0 !border-transparent bg-gradient-to-r from-purple-300 to-purple-500",
			red: "border-x-0 !border-transparent bg-gradient-to-r from-red-300 to-red-500",
			cyan: "border-x-0 !border-transparent bg-gradient-to-r from-cyan-300 to-cyan-500",
		},
	},
});

const textVariants = cva("", {
	variants: {
		color: {
			blue: "",
			purple: "",
			red: "",
			cyan: "",
		},
		bgColor: {
			blue: "text-white",
			purple: "text-white",
			red: "text-white",
			cyan: "text-white",
		},
	},
});

const iconVariants = cva("shadow-md shadow-gray-300", {
	variants: {
		color: {
			blue: "bg-blue-100 text-2xl text-blue-600",
			purple: "bg-purple-100 text-2xl text-purple-600",
			red: "bg-red-100 text-2xl text-red-600",
			cyan: "bg-cyan-100 text-2xl text-cyan-600",
		},
	},
});

function DataCard({
	className,
	bgColor,
	color,
	icon: Icon,
	title,
	value,
	loading = false,
}: VariantProps<typeof variants> & {
	className?: string;
	icon: IconType;
	title: string;
	value: React.ReactNode;
	loading?: boolean;
}) {
	return (
		<div
			className={cn(
				"col-span-full sm:col-span-6 lg:col-span-4 xl:col-span-3 3xl:col-span-2",
				className,
			)}
		>
			<Card className={variants({ bgColor })}>
				<div className="flex h-full items-center gap-6 p-4 2xl:p-5">
					<div
						className={cn(
							"flex size-14 shrink-0 items-center justify-center rounded-2xl",
							iconVariants({ color }),
						)}
					>
						<Icon className="text-xl lg:text-2xl" />
					</div>
					<div className="flex flex-col items-start justify-center gap-2">
						<div
							className={cn(
								"text-sm text-muted-foreground",
								textVariants({ bgColor }),
							)}
						>
							{title}
						</div>
						<Spinner className="me-auto" loading={loading} size="sm">
							<div className={cn("min-h-5 text-sm", textVariants({ bgColor }))}>
								{value ?? <FaExclamationTriangle />}
							</div>
						</Spinner>
					</div>
				</div>
			</Card>
		</div>
	);
}

export { DataCard };
