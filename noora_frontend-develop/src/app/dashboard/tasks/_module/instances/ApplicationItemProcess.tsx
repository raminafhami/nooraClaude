import { memo } from "react";

import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { Instance } from "@/felo/instances/models/Instance";
import {
	InspectionMethod,
	inspectionMethod,
} from "@/inspection/models/InspectionMethod";

function ApplicationItemProcess({ instance }: { instance: Instance }) {
	const { processName, parameters } = instance;

	const method =
		instance.processKey.startsWith("Inspection_Case") &&
		parameters["InspectionMethod"] &&
		inspectionMethod[parameters["InspectionMethod"] as InspectionMethod];

	return (
		<div className="flex gap-x-3">
			<div className="flex items-center gap-1">
				<span>{processName}</span>
				{method && (
					<span className="text-xs text-muted-foreground">({method})</span>
				)}
			</div>
			<InstanceStatusBadge instance={instance} />
		</div>
	);
}

const MemoizedApplicationItemProcess = memo(ApplicationItemProcess);

export { MemoizedApplicationItemProcess as ApplicationItemProcess };
