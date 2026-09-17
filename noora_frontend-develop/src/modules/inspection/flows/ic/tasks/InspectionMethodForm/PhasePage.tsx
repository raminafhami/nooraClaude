"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { inspectionMethodOptions } from "../../models/InspectionMethod";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { hooks } = useTaskContext();

	const { control, register, setValue, watch } = useFormContext<FormData>();

	const { [ids.assignees]: assignees } = watch();

	useEffect(() => {
		register(ids.assignees);
	}, [register]);

	useEffect(() => {
		if (!assignees) {
			setValue(ids.assignees, {});
		}
	}, [assignees, setValue]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					const { id, fullname: name } = identity;

					if (task.data["ownerGroup"] === "customer") {
						data[ids.assignees][AssigneeType.Customer] = { id, name };
					} else {
						data[ids.assignees][AssigneeType.Expert] = { id, name };
					}
				},
			);
		}
	}, [hooks, identity]);

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			<div className="col-span-3">
				<label htmlFor={ids.inspectionMethod}>روش بازرسی:</label>
				<div className="mt-2">
					<Controller
						control={control}
						name={ids.inspectionMethod}
						render={({ field, fieldState }) => (
							<>
								<Select items={inspectionMethodOptions} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>
			</div>
		</div>
	);
}
