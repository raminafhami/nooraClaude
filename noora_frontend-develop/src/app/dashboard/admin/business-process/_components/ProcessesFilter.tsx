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
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	searchTerm: z.string(),
});

type FormData = z.infer<typeof schema>;

export const ProcessesFilter = ({
	queryFilters,
	setQueryFilters,
}: {
	queryFilters: { searchTerm: string };
	setQueryFilters: Dispatch<
		SetStateAction<{
			searchTerm: string;
		}>
	>;
}) => {
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
	const { searchTerm } = watch();

	function handleSubmit(values: FormData) {
		setQueryFilters({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			const timeout = setTimeout(() => {
				formRef.current?.requestSubmit();
			}, 500);

			return () => clearTimeout(timeout);
		}
	}, [isDirty, isSubmitted, searchTerm]);

	return (
		<Form {...form}>
			<form
				ref={formRef}
				className="grid grid-cols-2 gap-3"
				onSubmit={handleRhfSubmit(handleSubmit)}
			>
				<FormField
					control={control}
					name="searchTerm"
					render={({ field }) => (
						<FormItem className="col-span-full sm:col-span-7 md:col-span-8 lg:col-span-9 2xl:col-span-10">
							<FormLabel>عنوان</FormLabel>
							<FormControl>
								<Input className="w-1/6" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
};
