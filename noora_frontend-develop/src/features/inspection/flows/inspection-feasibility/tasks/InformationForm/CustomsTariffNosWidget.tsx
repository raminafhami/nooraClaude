"use client";

import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";
import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

import { CustomsTariffNosItemList } from "../../components/CustomsTariffNosItemList";
import { ids } from "../../models/Ids";

const CustomsTariffNoAddDialog = dynamic(
	() => import("./CustomsTariffNoAddDialog"),
);

type FormSchema = Partial<{
	[ids.customsTariffNos]: string[];
}>;

function CustomsTariffNosWidget({ required }: { required?: boolean }) {
	const dialogs = useDialogs();

	const { control } = useFormContext<FormSchema>();

	return (
		<FormField
			control={control}
			name={ids.customsTariffNos}
			render={({ field }) => (
				<FormItem
					className={cn(
						"col-span-full !col-start-1 xl:col-span-9",
						!!field.value?.length && "space-y-4",
					)}
				>
					<div className="flex items-center gap-3">
						<FormLabel>
							کد تعرفه گمرکی
							{required && <span className="text-red-600"> *</span>}
						</FormLabel>

						<Button
							className="gap-1"
							size="xs"
							type="button"
							variant="outline"
							onClick={async () => {
								const result = await dialogs.open(CustomsTariffNoAddDialog);

								if (result) {
									field.onChange(
										Array.from(new Set([...(field.value ?? []), result])),
									);
								}
							}}
						>
							<FaPlus size={10} />
							<span>افزودن</span>
						</Button>
					</div>

					{!!field.value?.length ? (
						<CustomsTariffNosItemList
							codes={field.value}
							onItemRemove={(code) => {
								field.onChange(field.value!.filter((x) => x !== code));
							}}
						/>
					) : (
						<div className="text-muted-foreground">
							هنوز هیچ کد تعرفه ای اضافه نشده است.
						</div>
					)}

					<FormMessage />
				</FormItem>
			)}
			rules={{
				validate: (value) => {
					if (required && (!value || !value.length)) {
						return "افزودن حداقل یک مورد الزامی است.";
					}
				},
			}}
		/>
	);
}

export { CustomsTariffNosWidget };
