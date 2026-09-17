"use client";

import { useState } from "react";
import { FaRegFolderOpen } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { useTaskOuterContext } from "@/felo/tasks/hooks/useTaskOuterContext";
import { InspectionRiskLevelBadge } from "@/inspection/shared/components/InspectionRiskLevelBadge";
import { Modal } from "@/ui/Modal";

import { TaskFiles } from "./TaskFiles";

function TaskNavigation() {
	const { task } = useTaskOuterContext();

	const [show, setShow] = useState<boolean>(false);

	return (
		<div className="ms-4 flex flex-col gap-3 xs:flex-row">
			<InspectionRiskLevelBadge task={task} />

			<Button onClick={() => setShow(true)}>
				<FaRegFolderOpen />
				مدارک
			</Button>

			<Modal
				show={show}
				name="instance-files"
				size="4xl"
				title="مدارک درخواست"
				content={<TaskFiles />}
				onClose={() => setShow(false)}
			/>
		</div>
	);
}

export default TaskNavigation;
