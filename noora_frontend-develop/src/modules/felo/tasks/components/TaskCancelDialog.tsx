"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  instanceCancelReason,
  InstanceCancelReason,
  instanceCancelReasonOptions,
} from "@/felo/instances/enums/InstanceCancelReason";
import { isInstanceOtherReason } from "@/felo/instances/utils/isInstanceOtherReason";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
	.object({
		reason: z.custom<InstanceCancelReason>(),
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

function TaskCancelDialog({
	open,
	onClose,
}: DialogProps<
	undefined,
	{ reason: string; description?: string } | undefined
>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			reason: undefined,
			description: "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isSubmitting, isSubmitSuccessful },
		setValue,
		watch,
	} = form;

	const { reason } = watch();

	async function handleSubmit(values: FormSchema) {
		onClose({
			reason: values.reason,
			description:
				values.description.trim() || instanceCancelReason[values.reason].title,
		});
	}

	return (
		<Form {...form}>
			<Dialog open={open} onOpenChange={() => onClose(undefined)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>تایید لغو درخواست</DialogTitle>
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
											علت لغو<span className="text-red-600"> *</span>
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
													{instanceCancelReasonOptions.map((x) => (
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

						<DialogFooter
							className="flex-col sm:flex-row-reverse sm:justify-normal"
							dir="rtl"
						>
							<Button
								disabled={isSubmitting || isSubmitSuccessful}
								type="submit"
								variant="destructive"
							>
								لغو درخواست
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={() => onClose(undefined)}
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

export { TaskCancelDialog };
