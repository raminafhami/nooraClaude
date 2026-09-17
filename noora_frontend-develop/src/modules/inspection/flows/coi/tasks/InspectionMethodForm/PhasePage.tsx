"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { caseTypes } from "@/inspection/models/CaseType";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { inspectionMethods } from "../../models/InspectionMethod";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { hooks } = useTaskContext();

	const { control, register, resetField, watch } = useFormContext<FormData>();

	const assignees = watch(ids.assignees);

	useEffect(() => {
		register(ids.assignees);
	}, [register]);

	useEffect(() => {
		if (!assignees) {
			resetField(ids.assignees, { defaultValue: {} });
		}
	}, [assignees, resetField]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					const { id, fullname: name } = identity;

					if (task.data["ownerGroup"] === "coordinator") {
						data[ids.assignees][AssigneeType.Coordinator] = { id, name };
					} else {
						data[ids.assignees][AssigneeType.Admin] = { id, name };
					}
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.inspectionMethod}>روش بازرسی:</label>
					<Controller
						control={control}
						name={ids.inspectionMethod}
						render={({ field, fieldState }) => (
							<>
								<Select id={field.name} items={inspectionMethods} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.caseType}>نوع درخواست:</label>
					<Controller
						control={control}
						name={ids.caseType}
						render={({ field, fieldState }) => (
							<>
								<Select items={caseTypes} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
