"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Process } from "@/felo/processes/models/Process";
import { processGroup } from "@/felo/processes/models/ProcessGroup";
import { getProcesses } from "@/felo/processes/services/getProcesses";
import { groupDefinitions } from "@/felo/processes/utils/groupDefinitions";
import { TaskStatus, taskStatusOptions } from "@/felo/tasks/enums/TaskStatus";
import { Panel } from "@/ui/Panel";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	caseNo: z.string(),
	status: z.custom<TaskStatus>(),
	processDefinitionKey: z.string().nullable(),
});

type FormData = z.infer<typeof schema>;

function TasksFilter({
	queryFilters,
	setQueryFilters,
}: {
	queryFilters: {
		caseNo: string;
		status: TaskStatus;
		processDefinitionKey: string | null;
	};
	setQueryFilters: Dispatch<
		SetStateAction<{
			caseNo: string;
			status: TaskStatus;
			processDefinitionKey: string | null;
		}>
	>;
}) {
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormData>({
		defaultValues: {
			...queryFilters,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { isDirty, isSubmitted },
		handleSubmit: handleRhfSubmit,
		watch,
	} = form;
	const { caseNo, status } = watch();

	function handleSubmit(values: FormData) {
		setQueryFilters({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [isDirty, isSubmitted, caseNo, status]);

	const [definitionOptions, setDefinitionOptions] = useState<{
		[key: string]: Process[];
	}>();

	useEffect(() => {
		const getDefinitionOptions = async () => {
			try {
				const options = await getProcesses();
				const uniqueOptions = new Map();
				options.forEach((option) => {
					uniqueOptions.set(option.key, option);
				});

				const filteredOptions = Array.from(uniqueOptions.values());
				const sortedOptions = filteredOptions.sort((a, b) =>
					a.name.localeCompare(b.name),
				);

				const groupedOptions = groupDefinitions(sortedOptions);

				setDefinitionOptions(groupedOptions);
			} catch (err) {
				console.error(err);
			}
		};

		getDefinitionOptions();
	}, []);

	return (
		<Panel.Root className="px-0 pb-1">
			<Form {...form}>
				<form
					ref={formRef}
					className="flex flex-col gap-6 rounded-xl bg-white p-6 sm:flex-row"
					onSubmit={handleRhfSubmit(handleSubmit)}
				>
					<FormField
						control={control}
						name="caseNo"
						render={({ field }) => (
							<FormItem className="shrink-0 xs:min-w-56">
								<FormLabel>شماره درخواست / فایل بازرسی:</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="processDefinitionKey"
						render={({ field }) => (
							<FormItem className="shrink-0 xs:min-w-56">
								<FormLabel>نوع درخواست:</FormLabel>
								<FormControl>
									<Select
										value={field.value ?? "all"}
										onValueChange={(value) => {
											field.onChange(value === "all" ? null : value);
										}}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">همه درخواست ها</SelectItem>
											{definitionOptions &&
												Object.entries(definitionOptions).map(
													([key, definitions]) => (
														<SelectGroup key={key}>
															<SelectLabel dir="rtl">
																{processGroup[key]?.title}
															</SelectLabel>
															{definitions.map((definition, index) => (
																<SelectItem key={index} value={definition.key}>
																	{definition.name}
																</SelectItem>
															))}
														</SelectGroup>
													),
												)}
										</SelectContent>
									</Select>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="status"
						render={({ field }) => (
							<FormItem className="shrink-0 xs:min-w-56">
								<FormLabel>وضعیت کار:</FormLabel>
								<FormControl>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{taskStatusOptions.map((x) => (
												<SelectItem key={x.value} value={x.value}>
													{x.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</Panel.Root>
	);
}

export { TasksFilter };
