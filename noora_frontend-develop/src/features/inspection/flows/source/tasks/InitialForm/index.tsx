"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { CaseType, caseTypes } from "@/inspection/models/CaseType";
import { messages } from "@/messages";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.caseType]: z.custom<CaseType>(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
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
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {},
		);

		return () => hooks.removeAll();
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<FormField
				control={control}
				name={ids.caseType}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>نوع درخواست:</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{caseTypes.map((x) => (
										<SelectItem key={x.value} value={x.value}>
											{x.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: messages.validation.required }}
			/>
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
