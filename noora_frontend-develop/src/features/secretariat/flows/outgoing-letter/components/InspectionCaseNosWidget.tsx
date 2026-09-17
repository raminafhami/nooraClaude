"use client";

import { useFormContext } from "react-hook-form";
import { FaPencil, FaPlus, FaX } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { ids } from "../models/Ids";
import { InspectionCaseNoDialog } from "./InspectionCaseNoDialog";

type FormData = {
	[ids.relatedInspectionCaseNo]?: string[];
};

function InspectionCaseNosWidget() {
	const dialogs = useDialogs();

	const { control } = useFormContext<FormData>();

	return (
		<FormField
			control={control}
			name={ids.relatedInspectionCaseNo}
			render={({ field }) => (
				<FormItem className="col-span-full !col-start-1 xl:col-span-9">
					<div className="flex items-center gap-3">
						<FormLabel>شماره درخواست بازرسی مربوطه</FormLabel>

						<Button
							className="gap-1"
							size="xs"
							type="button"
							variant="outline"
							onClick={async () => {
								const result = await dialogs.open(InspectionCaseNoDialog, {});

								if (result) {
									field.onChange([...(field.value ?? []), result]);
								}
							}}
						>
							<FaPlus size={10} />
							<span>افزودن</span>
						</Button>
					</div>

					{field.value?.length ? (
						<div className="space-y-2">
							{field.value.map((caseNo, index) => (
								<div key={caseNo} className="flex gap-3">
									<div className="text-xs/5">
										<span>{index + 1}.</span>
									</div>

									<div>{caseNo}</div>

									<div className="flex gap-1">
										<Button
											className="size-5 rounded-sm bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700"
											size="icon"
											variant="link"
											type="button"
											onClick={async () => {
												const result = await dialogs.open(
													InspectionCaseNoDialog,
													{ caseNo },
												);

												if (result) {
													field.onChange(
														field.value!.map((x) =>
															x === caseNo ? result : x,
														),
													);
												}
											}}
										>
											<FaPencil size={10} />
										</Button>

										<Button
											className="size-5 rounded-sm bg-gray-100 hover:bg-red-100 hover:text-red-700"
											size="icon"
											variant="link"
											type="button"
											onClick={() => {
												field.onChange(
													field.value!.filter((x) => x !== caseNo),
												);
											}}
										>
											<FaX size={10} />
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-muted-foreground">
							هنوز هیچ درخواست بازرسی ای اضافه نشده است.
						</div>
					)}

					<FormMessage />
				</FormItem>
			)}
			rules={{}}
		/>
	);
}

export { InspectionCaseNosWidget };
