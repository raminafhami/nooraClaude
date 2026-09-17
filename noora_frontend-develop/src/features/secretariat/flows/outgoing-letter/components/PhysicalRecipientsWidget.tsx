"use client";

import { useFormContext } from "react-hook-form";
import { FaCaretLeft, FaPencil, FaPlus, FaX } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { ids } from "../models/Ids";
import { PhysicalRecipient } from "../models/PhysicalRecipient";
import { PhysicalRecipientUpsertDialog } from "./PhysicalRecipientUpsertDialog";

type FormData = {
	[ids.recipients]?: PhysicalRecipient[];
};

function PhysicalRecipientsWidget() {
	const dialogs = useDialogs();

	const { control } = useFormContext<FormData>();

	return (
		<FormField
			control={control}
			name={ids.recipients}
			render={({ field }) => {
				const physicalRecipients = field.value?.filter(
					(x) => x.type === "physical",
				);

				return (
					<FormItem className="col-span-full !col-start-1 xl:col-span-9">
						<div className="flex items-center gap-3">
							<FormLabel>گیرندگان</FormLabel>

							<Button
								className="gap-1"
								size="xs"
								type="button"
								variant="outline"
								onClick={async () => {
									const result = await dialogs.open(
										PhysicalRecipientUpsertDialog,
										{},
									);

									if (result) {
										field.onChange([...(field.value ?? []), result]);
									}
								}}
							>
								<FaPlus size={10} />
								<span>افزودن</span>
							</Button>
						</div>

						{physicalRecipients?.length ? (
							<div className="space-y-2">
								{physicalRecipients.map((recipient, index) => (
									<div key={recipient.id} className="flex gap-3">
										<div className="text-xs/5">
											<span>{index + 1}.</span>
										</div>

										<div className="flex items-center gap-2">
											{recipient.name}
											<FaCaretLeft />
											{recipient.address}
										</div>

										<div className="flex gap-1">
											<Button
												className="size-5 rounded-sm bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700"
												size="icon"
												variant="link"
												type="button"
												onClick={async () => {
													const result = await dialogs.open(
														PhysicalRecipientUpsertDialog,
														{ recipient },
													);

													if (result) {
														field.onChange(
															field.value!.map((x) =>
																x.id === recipient.id ? result : x,
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
														field.value!.filter((x) => x.id !== recipient.id),
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
								هنوز هیچ گیرنده ای اضافه نشده است.
							</div>
						)}

						<FormMessage />
					</FormItem>
				);
			}}
			rules={{
				validate: (value) => {
					if (
						!value ||
						value.filter((x) => x.type === "physical").length === 0
					) {
						return "افزودن حداقل یک مورد الزامی است.";
					}
				},
			}}
		/>
	);
}

export { PhysicalRecipientsWidget };
