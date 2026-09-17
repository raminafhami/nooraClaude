"use client";

import { memo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Indicator } from "@/indicator/models/Indicator";
import { createIndicator } from "@/indicator/services/createIndicator";
import { getIndicatorByKey } from "@/indicator/services/getIndicatorByKey";
import { updateIndicator } from "@/indicator/services/updateIndicator";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { MaskInput } from "@/ui/MaskInput/MaskInput";
import { NumberInput } from "@/ui/MaskInput/NumberInput";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	title: z.string().min(1, messages.validation.required),
	key: z.string().min(1, messages.validation.required),
	format: z
		.string()
		.min(1, messages.validation.required)
		.refine((value) => value.includes("#"), "فرمت وارد شده نامعتبر است."),
	counter: z.string().min(1, messages.validation.required),
});

type FormData = z.infer<typeof schema>;

interface Props {
	indicator: Indicator | null;
	refreshFn: () => Promise<void>;
	onCreateOrUpdate: () => void;
	onCancel: () => void;
}

function IndicatorsForm({
	indicator,
	refreshFn,
	onCreateOrUpdate: handleCreateOrUpdate,
	onCancel: handleCancel,
}: Props) {
	const {
		control,
		formState,
		handleSubmit: handleRhfSubmit,
		reset,
		setError,
	} = useForm<FormData>({
		defaultValues: {
			title: indicator?.title ?? "",
			key: indicator?.key ?? "",
			format: indicator?.format.replace("${counter}", "#") ?? "",
			counter: indicator?.counter.toString() ?? "",
		},
		resolver: zodResolver(schema),
		reValidateMode: "onBlur",
	});
	const { errors, isDirty, isSubmitting, isSubmitSuccessful } = formState;

	async function handleSubmit(values: FormData) {
		const { counter, format } = values;

		try {
			const duplicateIndicatorByKey = await getIndicatorByKey(values.key);

			if (
				duplicateIndicatorByKey &&
				(!indicator ||
					(indicator && duplicateIndicatorByKey.id !== indicator.id))
			) {
				setError("key", { message: "کلیدواژه مورد نظر تکراری است." });
				return;
			}

			if (!indicator) {
				await createIndicator({
					...values,
					format: format.replace("#", "${counter}"),
					counter: parseInt(counter),
				});

				toast.success("شمارنده مورد نظر با موفقیت ایجاد شد.");
			} else {
				await updateIndicator(indicator.id, {
					...values,
					format: format.replace("#", "${counter}"),
					counter: parseInt(counter),
				});

				toast.success("شمارنده مورد نظر با موفقیت بروزرسانی شد.");
			}

			handleCreateOrUpdate();
			refreshFn();
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی رخ داد.",
			});
		}
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({ title: "", key: "", counter: "", format: "" });
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<div className="space-y-10">
			<Head.Root>
				<Head.Title
					text={
						!indicator ? "افزودن شمارنده" : `ویرایش شمارنده: ${indicator.title}`
					}
				/>
			</Head.Root>

			<form className="space-y-10" onSubmit={handleRhfSubmit(handleSubmit)}>
				<fieldset
					className="grid grid-cols-1 gap-4"
					disabled={isSubmitting || isSubmitSuccessful}
				>
					<div className="flex gap-2">
						<label
							className="shrink-0 basis-12 py-2 xl:basis-28"
							htmlFor="title"
						>
							عنوان:
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="title"
								render={({ field, fieldState: { error } }) => (
									<>
										<Input id="title" {...field} />
										<FieldError error={error} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="flex gap-2">
						<label className="shrink-0 basis-12 py-2 xl:basis-28" htmlFor="key">
							کلیدواژه:
						</label>
						<div className="grow">
							<Controller
								name="key"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<>
										<MaskInput
											className="text-right"
											dir="ltr"
											id="key"
											mask={/^[a-zA-Z0-9-]+$/}
											{...field}
										/>
										<FieldError error={error} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="flex gap-2">
						<label
							className="shrink-0 basis-12 py-2 xl:basis-28"
							htmlFor="format"
						>
							ساختار:
						</label>
						<div className="grow">
							<Controller
								name="format"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<>
										<MaskInput
											className="text-right"
											dir="ltr"
											id="format"
											mask={/^[a-zA-Z0-9#-]*$/}
											{...field}
										/>
										<FieldError error={error} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="flex gap-2">
						<label
							className="shrink-0 basis-12 py-2 xl:basis-28"
							htmlFor="counter"
						>
							شروع از شماره:
						</label>
						<div className="grow">
							<Controller
								name="counter"
								control={control}
								render={({ field, fieldState: { error } }) => (
									<>
										<NumberInput
											className="text-right"
											dir="ltr"
											id="counter"
											{...field}
										/>
										<FieldError error={error} />
									</>
								)}
							/>
						</div>
					</div>
				</fieldset>

				{errors.root?.server && (
					<DestructiveAlert className="max-w-fit">
						<AlertDescription>{errors.root.server.message}</AlertDescription>
					</DestructiveAlert>
				)}

				<div className="ms-28 flex gap-3 ps-2">
					<Button disabled={isSubmitting || !isDirty} variant="primary">
						<span>{indicator ? "بروزرسانی" : "افزودن"}</span>
						{isSubmitting && <Loading intent="white" size="xs" />}
					</Button>

					{indicator && (
						<Button
							variant="ghost"
							type="button"
							onClick={() => handleCancel()}
						>
							انصراف
						</Button>
					)}
				</div>
			</form>
		</div>
	);
}

const PureIndicatorsForm = memo(IndicatorsForm);

export { PureIndicatorsForm as IndicatorsForm };
