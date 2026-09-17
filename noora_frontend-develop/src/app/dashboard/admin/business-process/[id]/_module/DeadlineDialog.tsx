"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	days: z.string(),
	hours: z.string(),
	minutes: z.string(),
});

type FormSchema = z.infer<typeof schema>;

function DeadlineDialog({
	payload: { name, deadline, onSubmit, onRemove },
	open,
	onClose,
}: DialogProps<
	{
		name: string;
		deadline?: string;
		onSubmit: (deadline: string) => Promise<void>;
		onRemove?: () => Promise<void>;
	},
	boolean
>) {
	const form = useForm<FormSchema>({
		defaultValues: (() => {
			const d = Number(deadline?.replace("m", "")) || undefined;

			return {
				days: d ? Math.floor(d / (24 * 60)).toString() : "",
				hours: d ? Math.floor((d % (24 * 60)) / 60).toString() : "",
				minutes: d ? Math.floor(d % 60).toString() : "",
			};
		})(),
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
		setValue,
		watch,
	} = form;

	const { minutes, hours, days } = watch();

	useEffect(() => {
		if (Number(minutes) >= 60) {
			const extraHours = Math.floor(Number(minutes) / 60);
			setValue("hours", (Number(hours) + extraHours).toString());
			setValue("minutes", (Number(minutes) % 60).toString());
		}
	}, [minutes, hours, setValue]);

	useEffect(() => {
		if (Number(hours) >= 24) {
			const extraDays = Math.floor(Number(hours) / 24);
			setValue("days", (Number(days) + extraDays).toString());
			setValue("hours", (Number(hours) % 24).toString());
		}
	}, [hours, days, setValue]);

	async function handleSubmit(values: FormSchema) {
		try {
			let minutes =
				Number(values.minutes) +
				Number(values.hours) * 60 +
				Number(values.days) * 24 * 60;
			await onSubmit(`${minutes.toString()}m`);
			onClose(true);
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی رخ داده است.",
			});
		}
	}

	// remove
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleRemove() {
		try {
			setIsPending(true);

			await onRemove!();
			onClose(true);
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی رخ داده است.",
			});
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>ویرایش مهلت انجام: {name}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						className="space-y-6"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset
							className="flex flex-1 flex-col gap-4 xs:flex-row"
							disabled={isPending || isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="minutes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>دقیقه</FormLabel>
										<FormControl>
											<Input className="text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="hours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>ساعت</FormLabel>
										<FormControl>
											<Input className="text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="days"
								render={({ field }) => (
									<FormItem>
										<FormLabel>روز</FormLabel>
										<FormControl>
											<Input className="text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<div className="flex flex-col gap-2 xs:flex-row-reverse">
							<Button
								className="xs:min-w-24"
								disabled={isPending || isSubmitting || isSubmitSuccessful}
								variant="primary"
								type="submit"
							>
								<Spinner loading={isSubmitting} size="sm">
									ثبت
								</Spinner>
							</Button>

							{onRemove && deadline && (
								<Button
									className="xs:min-w-24"
									disabled={isPending || isSubmitting || isSubmitSuccessful}
									variant="outline"
									type="button"
									onClick={handleRemove}
								>
									<Spinner loading={isPending} color="white" size="sm">
										<FaTrash />
									</Spinner>
									<span>برداشتن مهلت زمانی</span>
								</Button>
							)}

							<Button
								type="button"
								variant="ghost"
								onClick={() => onClose(false)}
							>
								بازگشت
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export { DeadlineDialog };
