"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	ExpertiseType,
	expertiseTypeOptions,
} from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { createExpertise } from "@/hrm/expertises/services/createExpertise";
import { updateExpertise } from "@/hrm/expertises/services/updateExpertise";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	type: z.custom<ExpertiseType>(Boolean, messages.validation.required),
	title: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function ExpertiseUpsertDialog({
	payload,
	open,
	onClose,
}: {
	payload?: Expertise;
	open: boolean;
	onClose: (result?: Expertise) => void;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<ExpertiseUpsertForm expertise={payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function ExpertiseUpsertForm({
	expertise,
	onClose,
}: {
	expertise?: Expertise;
	onClose: (result?: Expertise) => void;
}) {
	const form = useForm<FormSchema>({
		defaultValues: {
			type: expertise?.type,
			title: expertise?.title ?? "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			let upsertedExpertise: Expertise;

			if (expertise?.id) {
				upsertedExpertise = await updateExpertise(expertise.id, {
					title: values.title,
				});
			} else {
				upsertedExpertise = await createExpertise({
					type: values.type,
					title: values.title,
				});
			}

			onClose(upsertedExpertise);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<DialogContent className="max-w-screen-sm">
			<DialogHeader>
				<DialogTitle>
					{expertise?.id ? "ویرایش توانمندی" : "افزودن توانمندی"}
				</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form
					onSubmit={async (event) => {
						event.stopPropagation();
						await form.handleSubmit(handleSubmit)(event);
					}}
				>
					<fieldset
						className="space-y-8"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<div className="grid grid-cols-12 gap-6">
							{!expertise?.id && (
								<FormField
									control={control}
									name="type"
									render={({ field }) => (
										<FormItem className="col-span-full !col-start-1 sm:col-span-6">
											<FormLabel>
												نوع<span className="text-red-500"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger ref={field.ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{expertiseTypeOptions.map((x) => (
															<SelectItem key={x.value} value={x.value}>
																{x.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											عنوان<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button className="min-w-24" type="button" variant="primary">
								<Spinner color="white" loading={isSubmitting} size="sm">
									{expertise?.id ? "بروزرسانی" : "افزودن"}
								</Spinner>
							</Button>

							<Button type="button" variant="ghost" onClick={() => onClose()}>
								بازگشت
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</DialogContent>
	);
}

export { ExpertiseUpsertDialog };
