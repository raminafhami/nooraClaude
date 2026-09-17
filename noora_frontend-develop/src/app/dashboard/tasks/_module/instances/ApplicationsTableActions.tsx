"use client";

import { useContext, useState } from "react";
import { FaEye, FaUserCheck } from "react-icons/fa";

import { Modal } from "@/ui/Modal";
import { Table } from "@/ui/Table";

import { ApplicationContext } from "./ApplicationContext";
import { ApplicationDialog } from "./ApplicationDialog";
import DoneTasksModal from "./DoneTasksModal";

export function ApplicationsTableActions(): React.ReactNode {
	const {
		application: { instance },
	} = useContext(ApplicationContext);

	const [show, setShow] = useState<boolean>(false);
	const [taskDoneModal, setTasksDoneModal] = useState<boolean>(false);

	return (
		<>
			<Table.Actions>
				<Table.Action className="hover:text-blue-500">
					<div
						className="flex h-full w-full items-center justify-center"
						onClick={() => setShow(true)}
					>
						<FaEye />
					</div>
					<Modal
						show={show}
						name={`application-information-${instance.id}`}
						size="3xl"
						title={`اطلاعات درخواست ${instance.caseNo || ""}`}
						content={<ApplicationDialog />}
						onClose={() => setShow(false)}
					/>
				</Table.Action>

				<Table.Action className="hover:text-blue-500">
					<div
						className="flex h-full w-full items-center justify-center"
						onClick={() => {
							setTasksDoneModal(true);
						}}
					>
						<FaUserCheck />
					</div>
					{taskDoneModal && instance.id && (
						<DoneTasksModal
							isShow={taskDoneModal}
							setShow={setTasksDoneModal}
						/>
					)}
				</Table.Action>
			</Table.Actions>
		</>
	);
}
