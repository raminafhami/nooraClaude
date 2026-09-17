"use client";

import { useCallback } from "react";

import { Activity } from "@/activities/models/Activity";
import { Conditional } from "@/components/ui/conditional";
import { Dialog } from "@/components/ui/dialog";
import { Project } from "@/projects/models/Project";

import { BuyerActivityCreateForm } from "./BuyerActivityUpsertForm";

function BuyerActivityUpsertDialog({
	open,
	activity,
	project,
	onClose,
	onUnmount,
}: {
	open: boolean;
	activity?: Partial<Activity>;
	project: Project;
	onClose: (activity?: Activity) => void;
	onUnmount?: () => void;
}) {
	const handleDialogClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={open} onOpenChange={handleDialogClose}>
			<Conditional mount={open} delay onUnmount={onUnmount}>
				<BuyerActivityCreateForm
					activity={activity}
					project={project}
					onClose={onClose}
				/>
			</Conditional>
		</Dialog>
	);
}

export { BuyerActivityUpsertDialog };
