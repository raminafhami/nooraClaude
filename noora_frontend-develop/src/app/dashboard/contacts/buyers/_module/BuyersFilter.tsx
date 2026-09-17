import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BuyerType, buyerTypeOptions } from "@/buyers/enums/BuyerType";
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
import { SelectItemType } from "@/types/SelectItem";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	searchTerm: z.string(),
	type: z.custom<BuyerType>().nullable(),
});

type FormData = z.infer<typeof schema>;

const extendedBuyerTypeOptions: SelectItemType[] = [
	{ value: "all", label: "همه" },
	...buyerTypeOptions,
];

interface Props {
	queryFilters: {
		searchTerm: string;
		type: BuyerType | null;
	};
	setQueryFilters: Dispatch<
		SetStateAction<{
			searchTerm: string;
			type: BuyerType | null;
		}>
	>;
}

function BuyersFilter({ queryFilters, setQueryFilters }: Props) {
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
										placeholder="جستجوی نام، شناسه / کد ملی و شماره تماس"
										{...field}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="type"
						render={({ field }) => (
							<FormItem className="shrink-0 xs:min-w-56">
								<FormLabel>نوع خریدار:</FormLabel>
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
											{extendedBuyerTypeOptions.map((x) => (
												<SelectItem
													key={x.value}
													value={x.value}
													visible={x.visible}
												>
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

export { BuyersFilter };
