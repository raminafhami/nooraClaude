"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ExpertiseType,
	expertiseTypeOptions,
} from "@/hrm/expertises/enums/ExpertiseType";
import { SelectItemType } from "@/types/SelectItem";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	searchTerm: z.string(),
	type: z.custom<ExpertiseType>().nullable(),
});

type FormData = z.infer<typeof schema>;

const extendedExpertiseTypeOptions: SelectItemType[] = [
	{ value: "all", label: "همه" },
	...expertiseTypeOptions,
];

function ExpertisesFilter({
	queryFilters,
	setQueryFilters,
}: {
	queryFilters: {
		searchTerm: string;
		type: ExpertiseType | null;
	};
	setQueryFilters: Dispatch<
		SetStateAction<{
			searchTerm: string;
			type: ExpertiseType | null;
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
	const { searchTerm, type } = watch();

	function handleSubmit(values: FormData) {
		setQueryFilters({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [isDirty, isSubmitted, searchTerm, type]);

	return (
		<div className="px-6">
			<Form {...form}>
				<form
					ref={formRef}
					className="grid grid-cols-12 gap-3"
					onSubmit={handleRhfSubmit(handleSubmit)}
				>
					<FormField
						control={control}
						name="searchTerm"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-7 md:col-span-8 lg:col-span-9 2xl:col-span-10">
								<FormLabel>جستجو:</FormLabel>
								<FormControl>
									<Input placeholder="جستجوی عنوان" {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="type"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-5 md:col-span-4 lg:col-span-3 2xl:col-span-2">
								<FormLabel>نوع:</FormLabel>
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
											{extendedExpertiseTypeOptions.map((x) => (
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
		</div>
	);
}

export { ExpertisesFilter };
