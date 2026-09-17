"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	instanceHoldReason,
	InstanceHoldReason,
	instanceHoldReasonOptions,
} from "@/felo/instances/enums/InstanceHoldReason";
import { isInstanceOtherReason } from "@/felo/instances/utils/isInstanceOtherReason";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import { TaskSubmitType } from "../enums/TaskSubmitType";
import { Task } from "../models/Task";
import { submitTask } from "../services/submitTask";

const formSchema = z
	.object({
		reason: z.custom<InstanceHoldReason>(Boolean, messages.validation.required),
		description: z.string(),
	})
	.refine(
		({ reason, description }) => !isInstanceOtherReason(reason) || description,
		{
			path: ["description"],
			message: messages.validation.required,
		},
	);

type FormSchema = z.infer<typeof formSchema>;

type TaskHoldDialogPayload = {
	task: Task;
};

function TaskHoldDialog({
	payload: { task },
	open,
	onClose,
}: DialogProps<TaskHoldDialogPayload, boolean>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			reason: undefined,
			description: "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
		setValue,
		watch,
	} = form;

	const { reason } = watch();

	async function handleSubmit(values: FormSchema) {
		try {
			await submitTask({
				instanceId: task.instanceId,
				taskId: task.taskId,
				taskKey: task.key,
				status: TaskSubmitType.Hold,
				data: {},
				reason: values.reason,
				description:
					values.description.trim() || instanceHoldReason[values.reason]?.title,
			});

			toast.success("کار مورد نظر با موفقیت متوقف شد.");

			onClose(true);
		} catch (err) {
			console.error(err);

			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Form {...form}>
			<Dialog open={open} onOpenChange={() => onClose(false)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>تایید توقف کار</DialogTitle>
					</DialogHeader>

					<form
						className="grid gap-4"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset
							className="space-y-4"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="reason"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											علت توقف<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												value={field.value}
												onValueChange={(value) => {
													field.onChange(value);
													setValue("description", "");
												}}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{instanceHoldReasonOptions.map((x) => (
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

							{isInstanceOtherReason(reason) && (
								<FormField
									control={control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												توضیحات<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<DialogFooter
							className="flex-col sm:flex-row-reverse sm:justify-normal"
							dir="rtl"
						>
							<Button
								disabled={isSubmitting || isSubmitSuccessful}
								type="submit"
								variant="primary"
							>
								<Spinner
									loading={isSubmitting || isSubmitSuccessful}
									color="white"
									size="sm"
								>
									توقف کار
								</Spinner>
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={() => onClose(false)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</Form>
	);
}

export { TaskHoldDialog };
