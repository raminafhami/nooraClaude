"use client";

import { memo } from "react";

import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

import { NavItemProps } from "./navService";

const UpMenu = ({ items }: { items: NavItemProps[] }) => {
	return (
		<div className="mx-2 hidden items-center lg:flex">
			<TooltipProvider delayDuration={0}>
				{items.map((item) => (
					<Tooltip key={item.url}>
						<TooltipTrigger asChild>
							<DynamicLink href={item.type === "LINK" ? item.url : ""}>
								{item.icon}
							</DynamicLink>
						</TooltipTrigger>
						<TooltipContent
							side="bottom"
							align="center"
							className="rounded-xl border-none bg-[#17364E] text-sm text-white shadow-md shadow-gray-600"
						>
							{item.label}
						</TooltipContent>
					</Tooltip>
				))}
			</TooltipProvider>
		</div>
	);
};

export default memo(UpMenu);
