"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPenToSquare } from "react-icons/fa6";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
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
import { MaskInput } from "@/components/ui/mask-input";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateUserCredit } from "@/identity/users/services/updateUserCredit";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCustomerContext } from "../CustomerContext";

const formSchema = z.object({
	credit: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function CustomerRecordCredit() {
	const { identity } = useLoggedInUser();
	const { customer } = useCustomerContext();

	const canEdit = identity.groups.includes("credit-manager");

	const [open, setOpen] = useState<boolean>(false);

	const handleClose = useCallback(() => {
		setOpen(false);
	}, []);

	return (
		<>
			<div className="col-span-full space-y-2 xs:col-span-6">
				<div className="text-muted-foreground">
					<span>میزان اعتبار</span>
				</div>
				<div className="flex gap-1">
					<div>
						<span className="tracking-wide">
							{toCurrency(customer.credit.toString())}
						</span>{" "}
						ریال
					</div>
					{canEdit && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="text-muted-foreground"
										size="icon"
										type="button"
										variant="link"
										onClick={() => setOpen(true)}
									>
										<FaPenToSquare />
									</Button>
								</TooltipTrigger>
								<TooltipContent>ویرایش اعتبار مشتری</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
			</div>

			{canEdit && (
				<Dialog open={open} onOpenChange={setOpen}>
					<Conditional mount={open} delay>
						<CustomerCreditEditForm onClose={handleClose} />
					</Conditional>
				</Dialog>
			)}
		</>
	);
}

function CustomerCreditEditForm({ onClose }: { onClose: () => void }) {
	const { customer, updateCustomer } = useCustomerContext();

	const form = useForm<FormSchema>({
		defaultValues: {
			credit: customer.credit.toString(),
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			const { credit: updatedCredit } = await updateUserCredit(customer.id, {
				amount: Number(values.credit),
				isFixed: true,
			});

			updateCustomer({ credit: updatedCredit });
			onClose();
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<DialogContent className="max-w-screen-xs">
			<DialogHeader>
				<DialogTitle>ویرایش اعتبار مشتری</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form
					onSubmit={async (e) => {
						e.stopPropagation();
						await handleRhfSubmit(handleSubmit)(e);
					}}
				>
					<fieldset
						className="space-y-8"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<div className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="credit"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											اعتبار<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<MaskInput
												className="rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask={Number}
												scale={0}
												thousandsSeparator=","
												unmask
												onAccept={onChange}
												{...field}
											/>
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
							<Button className="min-w-24" variant="primary">
								<Spinner color="white" loading={isSubmitting} size="sm">
									بروزرسانی
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

export { CustomerRecordCredit };
