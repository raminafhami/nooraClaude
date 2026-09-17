"use client";

import { memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/form/Input";
import { Card } from "@/ui/Card";

import { ApplicationQuery } from "./models/ApplicationQuery";

interface Props {
	onQueryUpdate: (query: ApplicationQuery) => void;
}

export const ApplicationsSearch = memo(function ApplicationsSearch({
	onQueryUpdate,
}: Props) {
	const { control, handleSubmit, register } = useForm<ApplicationQuery>();

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
		<Card>
			<form
				className="relative px-4 py-2"
				onSubmit={handleSubmit((values) => {
					onQueryUpdate(values);
				})}
			>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
					<div className="space-y-2">
						<label htmlFor="instance.caseNo">
							شماره درخواست / فایل بازرسی:
						</label>
						<Input id="instance.caseNo" {...register("caseNo")} />
					</div>
					<Controller
						control={control}
						name="processDefinitionKey"
						render={({ field }) => (
							<div className="space-y-2">
								<label htmlFor={field.name}>نوع درخواست:</label>
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
							</div>
						)}
					/>
				</div>
				<div className="absolute -bottom-6 end-4 place-self-end">
					<Button className="rounded-full">جستجو</Button>
				</div>
			</form>
		</Card>
	);
});
