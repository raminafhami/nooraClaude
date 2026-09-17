"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranches } from "@/branches/services/getBranches";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	InstanceStatus,
	instanceStatusOptions,
} from "@/felo/instances/enums/InstanceStatus";
import { processGroup } from "@/felo/processes/models/ProcessGroup";
import { getProcesses } from "@/felo/processes/services/getProcesses";
import { groupDefinitions } from "@/felo/processes/utils/groupDefinitions";
import { Input } from "@/form/Input";
import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { zodResolver } from "@hookform/resolvers/zod";

import { InstanceFilterArgs } from "./InstanceList.types";

const formSchema = z.object({
	caseNo: z.string(),
	processDefinitionKey: z.string(),
	status: z.custom<InstanceStatus>().nullable(),
	branchId: z.string(),
	contractNo: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function InstanceFilter({
	filterArgs,
	onFilterArgsUpdate,
}: {
	filterArgs: InstanceFilterArgs;
	onFilterArgsUpdate: (filterArgs: InstanceFilterArgs) => void;
}) {
	const { identity } = useLoggedInUser();

	const { processGroupOptions } = useProcessOptions();
	const { branchOptions } = useBranchOptions();

	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormSchema>({
		defaultValues: {
			caseNo: filterArgs.caseNo ?? "",
			processDefinitionKey: filterArgs.processDefinitionKey ?? "",
			status: filterArgs.status ?? null,
			branchId: filterArgs.branchId ?? "",
			contractNo: filterArgs.contractNo ?? "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isDirty, isSubmitted },
		watch,
	} = form;

	const { caseNo, processDefinitionKey, status, branchId, contractNo } =
		watch();

	function handleSubmit(values: FormSchema) {
		onFilterArgsUpdate({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [
		isDirty,
		isSubmitted,
		caseNo,
		processDefinitionKey,
		status,
		branchId,
		contractNo,
	]);

	return (
		<div className="px-6">
			<Form {...form}>
				<form
					ref={formRef}
					className="grid grid-cols-12 gap-3"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<FormField
						control={control}
						name="caseNo"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>شماره درخواست</FormLabel>
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
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>نوع درخواست</FormLabel>
								<FormControl>
									<Select
										value={field.value || "all"}
										onValueChange={(value) => {
											field.onChange(value === "all" ? "" : value);
										}}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="max-h-64">
											<SelectItem value="all">همه درخواست ها</SelectItem>
											{processGroupOptions &&
												Object.entries(processGroupOptions).map(
													([key, processes]) => (
														<SelectGroup key={key}>
															<SelectLabel dir="rtl">
																{processGroup[key]?.title}
															</SelectLabel>
															{processes.map((process) => (
																<SelectItem
																	key={process.value}
																	value={process.value}
																>
																	{process.label}
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
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>وضعیت درخواست</FormLabel>
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
										<SelectContent className="max-h-64">
											<SelectItem value="all">همه وضعیت ها</SelectItem>
											{instanceStatusOptions.map((item) => (
												<SelectItem key={item.value} value={item.value}>
													{item.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
							</FormItem>
						)}
					/>

					{!identity.branchId && (
						<FormField
							control={control}
							name="branchId"
							render={({ field }) => (
								<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
									<FormLabel>شعبه</FormLabel>
									<FormControl>
										<Select
											value={field.value || "all"}
											onValueChange={(value) => {
												field.onChange(value === "all" ? "" : value);
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="max-h-64">
												<SelectItem value="all">همه شعب</SelectItem>
												<SelectItem value="headquarters">دفتر مرکزی</SelectItem>
												{branchOptions?.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
								</FormItem>
							)}
						/>
					)}

					<FormField
						control={control}
						name="contractNo"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>شماره قرارداد</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</div>
	);
}

function useProcessOptions() {
	const [groupOptions, setGroupOptions] = useState<{
		[key: string]: SelectItemType[];
	}>();

	useEffect(() => {
		const getProcessOptions = async () => {
			try {
				const processes = await getProcesses({
					filters: {
						$or: [
							{ key: { $regex: `^Inspection_Case` } },
							{ key: { $regex: `Sampling$` } },
						],
					},
					sort: { name: "asc" },
				});

				// remove duplicate processes by key and keep latest version
				const uniqueDefinitions = new Map();
				processes.forEach((definition) => {
					uniqueDefinitions.set(definition.key, definition);
				});

				const groupedDefinitions = groupDefinitions(
					Array.from(uniqueDefinitions.values()),
				);

				const groupOptions = getObjectEntries(groupedDefinitions)
					.map(([key, processes]) => ({
						[key]: processes.map((definition) => ({
							value: definition.key,
							label: definition.name,
						})),
					}))
					.reduce((acc, curr) => ({ ...acc, ...curr }), {});

				setGroupOptions(groupOptions);
			} catch (err) {
				console.error(err);
			}
		};

		getProcessOptions();
	}, []);

	return {
		processGroupOptions: groupOptions,
	};
}

function useBranchOptions() {
	const { identity } = useLoggedInUser();

	const [options, setOptions] = useState<SelectItemType[]>();

	useEffect(() => {
		const getBranchOptions = async () => {
			if (identity.branchId) return;

			try {
				const branches = await getBranches({ sort: { title: "asc" } });

				const options = branches.map((branch) => ({
					value: branch.id,
					label: branch.title,
				}));

				setOptions(options);
			} catch (err) {
				console.error(err);
			}
		};

		getBranchOptions();
	}, [identity.branchId]);

	return { branchOptions: options };
}

export { InstanceFilter };
