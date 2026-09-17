"use client";

import { FaX } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { ProjectTaskLabel } from "../models/ProjectTaskLabel";

const ProjectLabelSelectDisplay = ({
	className,
	disabled,
	value,
	onChange,
}: {
	className?: string;
	disabled?: boolean;
	value: ProjectTaskLabel[] | undefined;
	onChange: (labels: ProjectTaskLabel[] | undefined) => void;
}) => {
	if (!value?.length) return null;

	return (
		<div className={cn("flex flex-wrap gap-2", className)}>
			{value.map((item) => (
				<Badge key={item.id} className="bg-gray-100 py-1 text-gray-900">
					<span>{item.title}</span>
					<FaX
						className="cursor-pointer"
						size={10}
						onClick={() => {
							if (disabled) return;
							onChange(value!.filter((x) => x.id !== item.id));
						}}
					/>
				</Badge>
			))}
		</div>
	);
};

export { ProjectLabelSelectDisplay };
