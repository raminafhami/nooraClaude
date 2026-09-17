"use client";

import { useContext, useEffect } from "react";

import { instanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { messages } from "@/messages";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { TimeRelative } from "@/ui/Time";

import InstanceSteps from "../instanceSteps/InstanceSteps";
import { ApplicationContext } from "./ApplicationContext";

export function ApplicationDetails(): React.ReactNode {
	const {
		application: { instance, tasks },
	} = useContext(ApplicationContext);

	useEffect(() => {
		console.log("Instance: ", instance);
	}, [instance]);

	const index = instance?.processPhases?.findIndex(
		(step) =>
			step.name === instance?.phase?.name &&
			step.title === instance?.phase?.title,
	);

	return (
		<div>
			<div className="my-6 grid grid-cols-12 gap-x-10 gap-y-4 px-16">
				<div className="col-span-6 flex">
					<div className="font-bold">عنوان درخواست:</div>
					<div className="ms-2">{instance.name || instance.processName}</div>
				</div>
				<div className="col-span-6 flex">
					<div className="font-bold">مرحله کنونی:</div>
					<div className="ms-2">{instance.phase?.title || "?"}</div>
				</div>
				<div className="col-span-6 flex">
					<div className="font-bold">وضعیت درخواست:</div>
					<div className="ms-2">{instanceStatus[instance.status!]}</div>
				</div>
				<div className="col-span-6 flex">
					<div className="font-bold">زمان ثبت درخواست:</div>
					<div className="ms-2">
						<TimeRelative time={instance.createAt!} />
					</div>
				</div>
			</div>
			{tasks && tasks.length !== 0 && (
				<div className="my-10 px-16">
					<div className="py-2 font-bold">کارهای در حال اجرا:</div>
					<Panel.Root>
						<Table.Root>
							<Table.Head>
								<Table.Row className="bg-gray-100 text-right">
									<Table.Cell className="py-3" as="th">
										عنوان
									</Table.Cell>
									<Table.Cell className="py-3" as="th">
										مسئول
									</Table.Cell>
								</Table.Row>
							</Table.Head>
							<Table.Body>
								{tasks.map(({ task, assigneeName, userNames, groupNames }) => (
									<Table.Row key={task.id}>
										<Table.Cell>{task.name}</Table.Cell>
										<Table.Cell>
											{assigneeName ||
												[...userNames, ...groupNames].join("، ") ||
												"-"}
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Panel.Root>
				</div>
			)}
			<div className="my-10 -me-6 -ms-6 overflow-hidden">
				{/* <Image
          className="max-w-full h-auto pointer-events-none"
          src={timeline}
          quality={100}
          alt=""
        /> */}
				<div>
					<InstanceSteps
						steps={instance?.processPhases || []}
						currentStep={index ?? 0}
					/>
				</div>
			</div>
		</div>
	);
}
