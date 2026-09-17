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

function CustomersFilter({
	queryFilters,
	setQueryFilters,
}: {
	queryFilters: {
		searchTerm: string;
	};
	setQueryFilters: Dispatch<
		SetStateAction<{
			searchTerm: string;
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
	const { searchTerm } = watch();

	function handleSubmit(values: FormData) {
		setQueryFilters({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [isDirty, isSubmitted, searchTerm]);

	return (
		<div className="px-6">
			<Form {...form}>
				<form
					ref={formRef}
					className="flex flex-col gap-3 sm:flex-row"
					onSubmit={handleRhfSubmit(handleSubmit)}
				>
					<FormField
						control={control}
						name="searchTerm"
						render={({ field }) => (
							<FormItem className="grow">
								<FormLabel>جستجو:</FormLabel>
								<FormControl>
									<Input
										placeholder="جستجوی نام، کد ملی و شماره همراه"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		</div>
	);
}

export { CustomersFilter };
