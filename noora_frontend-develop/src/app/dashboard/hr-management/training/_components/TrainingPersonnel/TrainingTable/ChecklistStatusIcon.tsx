"use client";

import { FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { GiSandsOfTime } from "react-icons/gi";

import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { cn } from "@/lib/utils";

// دارد (green tick) / در حال آموزش (yellow hourglass, as in the add-job
// modal) / ندارد (red cross).
export function ChecklistStatusIcon({
	status,
}: {
	status: PersonnelExpertiseStatus | null;
}) {
	return (
		<span
			className={cn(
				"h-4 w-4 shrink-0 rounded-full p-[2px]",
				status === PersonnelExpertiseStatus.Qualified
					? "bg-green-200"
					: status === PersonnelExpertiseStatus.Learning
						? "bg-yellow-200"
						: "bg-red-200",
			)}
			title={
				status === PersonnelExpertiseStatus.Learning ? "در حال آموزش" : undefined
			}
		>
			{status === PersonnelExpertiseStatus.Qualified ? (
				<FaCheck className="text-xs text-green-600" />
			) : status === PersonnelExpertiseStatus.Learning ? (
				<GiSandsOfTime className="text-xs text-yellow-600" />
			) : (
				<FaTimes className="text-xs text-red-600" />
			)}
		</span>
	);
}
