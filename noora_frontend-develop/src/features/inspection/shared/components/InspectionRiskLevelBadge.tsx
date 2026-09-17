import { FaTriangleExclamation } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { Task } from "@/felo/tasks/models/Task";
import { cn } from "@/lib/utils";

import {
	InspectionRiskLevel,
	inspectionRiskLevels,
} from "../enums/InspectionRiskLevel";

const InspectionRiskLevelBadge = ({ task }: { task: Pick<Task, "data"> }) => {
	if (!task.data["RiskLevel"]) {
		return null;
	}

	return (
		<Badge
			className={cn(
				"flex cursor-default select-none gap-2 px-4 py-2 text-xsm shadow-md",
				task.data["RiskLevel"] === InspectionRiskLevel.Normal &&
					"bg-blue-100 text-blue-900",
				task.data["RiskLevel"] === InspectionRiskLevel.High &&
					"bg-yellow-100 text-yellow-900",
				task.data["RiskLevel"] === InspectionRiskLevel.VeryHigh &&
					"bg-red-100 text-red-900",
			)}
		>
			<FaTriangleExclamation />
			<span>
				سطح ریسک:&nbsp;
				{
					inspectionRiskLevels[task.data["RiskLevel"] as InspectionRiskLevel]
						?.title
				}
			</span>
		</Badge>
	);
};

export { InspectionRiskLevelBadge };
