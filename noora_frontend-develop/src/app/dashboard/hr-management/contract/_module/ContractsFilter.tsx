"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DateInput } from "@/components/ui/date-input";
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
	ContractStatus,
	contractStatusOptions,
} from "@/hrm/contract/enums/ContractStatus";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import { SelectItemType } from "@/types/SelectItem";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	searchTerm: z.string(),
	user: z.custom<UserLookup>().nullable(),
	status: z.custom<ContractStatus>().nullable(),
	dateFrom: z.string(),
	dateTo: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const extendedContractStatusOptions: SelectItemType[] = [
	{ value: "all", label: "همه وضعیت ها" },
	...contractStatusOptions,
];

function ContractsFilter({
	queryFilters,
	setQueryFilters,
}: {
	queryFilters: {
		searchTerm: string;
		user: UserLookup | null;
		status: ContractStatus | null;
		dateFrom: string;
		dateTo: string;
	};
	setQueryFilters: Dispatch<
		SetStateAction<{
			searchTerm: string;
			user: UserLookup | null;
			status: ContractStatus | null;
			dateFrom: string;
			dateTo: string;
		}>
	>;
}) {
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormSchema>({
		defaultValues: {
			...queryFilters,
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isDirty, isSubmitted },
		handleSubmit: handleRhfSubmit,
		watch,
	} = form;
	const { searchTerm, user, status, dateFrom, dateTo } = watch();

	function handleSubmit(values: FormSchema) {
		setQueryFilters({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [isDirty, isSubmitted, searchTerm, user, status, dateFrom, dateTo]);

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
							<FormItem className="col-span-full md:col-span-6 lg:col-span-8">
								<FormLabel>جستجو:</FormLabel>
								<FormControl>
									<Input
										placeholder="جستجوی شماره قرارداد و محل کار"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="user"
						render={({ field: { onChange, ...field } }) => (
							<FormItem className="col-span-full sm:col-span-6 md:col-span-3 lg:col-span-2">
								<FormLabel>پرسنل:</FormLabel>
								<FormControl>
									<UserLookupSelect
										placeholder="همه پرسنل"
										type={UserType.Personnel}
										onValueChange={onChange}
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="status"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-6 md:col-span-3 lg:col-span-2">
								<FormLabel>وضعیت قرارداد:</FormLabel>
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
											{extendedContractStatusOptions.map((x) => (
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

					{/* <FormField
						control={control}
						name="dateFrom"
						render={({ field }) => (
							<FormItem className="shrink-0 xs:min-w-56">
								<FormLabel>تاریخ از:</FormLabel>
								<FormControl>
									<DateInput {...field} />
								</FormControl>
							</FormItem>
						)}
					/> */}

					{/* <FormField
						control={control}
						name="dateTo"
						render={({ field }) => (
							<FormItem className="shrink-0 xs:min-w-56">
								<FormLabel>تاریخ به:</FormLabel>
								<FormControl>
									<DateInput {...field} />
								</FormControl>
							</FormItem>
						)}
					/> */}
				</form>
			</Form>
		</div>
	);
}

export { ContractsFilter };
