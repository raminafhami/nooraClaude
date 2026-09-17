"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { caseTypes } from "@/inspection/models/CaseType";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";

import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
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
				async ({ task, data }: { task: Task; data: FormData }) => {},
			);
		}
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<div className="col-span-3 col-start-1 space-y-2">
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
	);
}
