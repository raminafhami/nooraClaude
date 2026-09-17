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
import { Spinner } from "@/components/ui/spinner";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	caseNo: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function InspectionCaseNoDialog({
	payload: { caseNo },
	open,
	onClose,
}: DialogProps<{ caseNo?: string }, string>) {
	const form = useForm<FormSchema>({
		defaultValues: { caseNo: caseNo ?? "" },
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isSubmitting, isSubmitSuccessful },
	} = form;

	function handleSubmit(values: FormSchema) {
		onClose(values.caseNo);
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-xs">
				<DialogHeader>
					<DialogTitle>
						{caseNo
							? "ویرایش شماره درخواست بازرسی"
							: "افزودن درخواست بازرسی جدید"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="space-y-4">
								<FormField
									control={control}
									name="caseNo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												شماره درخواست<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input
													className="rtl:text-right"
													dir="ltr"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
								<Button className="sm:min-w-24" variant="primary">
									<Spinner loading={isSubmitting} size="sm">
										{caseNo ? "بروزرسانی" : "افزودن"}
									</Spinner>
								</Button>

								<Button
									type="button"
									variant="ghost"
									onClick={onClose.bind(null, undefined)}
								>
									بازگشت
								</Button>
							</DialogFooter>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export { InspectionCaseNoDialog };
