"use client";

import dynamic from "next/dynamic";
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
import { Transcription } from "../models/Transcription";

const TranscriptionUpsertDialog = dynamic(
	() => import("./TranscriptionUpsertDialog"),
);

type FormSchema = {
	[ids.letterTranscriptions]: Transcription[];
};

function TranscriptionsWidget() {
	const dialogs = useDialogs();

	const { control } = useFormContext<FormSchema>();

	return (
		<FormField
			control={control}
			name={ids.letterTranscriptions}
			render={({ field }) => (
				<FormItem className="col-span-full !col-start-1 xl:col-span-9">
					<div className="flex items-center gap-3">
						<FormLabel>رونوشت ها</FormLabel>

						<Button
							className="gap-1"
							size="xs"
							type="button"
							variant="outline"
							onClick={async () => {
								const result = await dialogs.open(
									TranscriptionUpsertDialog,
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

					{field.value?.length ? (
						<div className="space-y-2">
							{field.value?.map((transcription, index) => (
								<div key={transcription.id} className="flex gap-3">
									<div className="text-xs/5">
										<span>{index + 1}.</span>
									</div>

									<div>{transcription.value}</div>

									<div className="flex gap-1">
										<Button
											className="size-5 rounded-sm bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700"
											size="icon"
											variant="link"
											type="button"
											onClick={async () => {
												const result = await dialogs.open(
													TranscriptionUpsertDialog,
													{ transcription },
												);

												if (result) {
													field.onChange(
														field.value!.map((x) =>
															x.id === transcription.id ? result : x,
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
													field.value!.filter((x) => x.id !== transcription.id),
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
							هنوز هیچ رونوشتی اضافه نشده است.
						</div>
					)}

					<FormMessage />
				</FormItem>
			)}
			rules={{}}
		/>
	);
}

export { TranscriptionsWidget };
