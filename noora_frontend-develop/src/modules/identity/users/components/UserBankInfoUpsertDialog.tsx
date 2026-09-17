"use client";

import { isShebaValid, verifyCardNumber } from "persian-tools";
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
import { MaskInput } from "@/components/ui/mask-input";
import { Separator } from "@/components/ui/separator";
import { UserBankInfo } from "@/identity/users/models/UserBankInfo";
import { addUserBankInfo } from "@/identity/users/services/addUserBankInfo";
import { updateUserBankInfo } from "@/identity/users/services/updateUserBankInfo";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

function UserBankInfoUpsertDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		userId: string;
		bankInfo?: UserBankInfo;
	},
	UserBankInfo | undefined
>) {
	const formSchema = z.object({
		title: z.string().min(1, messages.validation.required),
		bankName: z.string().min(1, messages.validation.required),
		bankAccountNumber: z.string(),
		bankCardNumber: z
			.string()
			.min(1, messages.validation.required)
			.refine(
				(value) => !value || (value.length === 16 && verifyCardNumber(+value)),
				"شماره کارت وارد شده نامعتبر است.",
			),
		bankSheba: z
			.string()
			.refine(
				(value) => !value || (value.length === 26 && isShebaValid(value)),
				"شماره شبا وارد شده نامعتبر است.",
			),
		bankAccountOwner: z.string(),
		bankBranch: z.string(),
	});

	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: payload.bankInfo?.title ?? "",
			bankName: payload.bankInfo?.bankName ?? "",
			bankAccountNumber: payload.bankInfo?.bankAccountNumber ?? "",
			bankAccountOwner: payload.bankInfo?.bankAccountOwner ?? "",
			bankBranch: payload.bankInfo?.bankBranch ?? "",
			bankCardNumber: payload.bankInfo?.bankCardNumber ?? "",
			bankSheba: payload.bankInfo?.bankSheba ?? "",
		},
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		const bankInfo = {
			title: values.title,
			bankAccountNumber: values.bankAccountNumber,
			bankCardNumber: values.bankCardNumber,
			bankName: values.bankName,
			bankSheba: values.bankSheba,
			bankAccountOwner: values.bankAccountOwner,
			bankBranch: values.bankBranch,
		};

		if (payload.bankInfo) {
			try {
				await updateUserBankInfo(payload.userId, payload.bankInfo.id, bankInfo);
				toast.success("حساب با موفقیت ویرایش شد");
				onClose({ ...bankInfo, id: payload.bankInfo.id });
			} catch (err: any) {
				console.error(err);
				setError("root.server", {
					message: "خطای نامشخصی در ویرایش حساب رخ داد.",
				});
			}
		} else {
			try {
				const user = await addUserBankInfo(payload.userId, bankInfo);
				toast.success("حساب با موفقیت اضافه شد");
				onClose({
					...bankInfo,
					id: user.bankInfos![user.bankInfos!.length - 1].id,
				});
			} catch (err: any) {
				console.error(err);
				setError("root.server", {
					message: "خطای نامشخصی در ثبت حساب رخ داد.",
				});
			}
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-sm"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{payload.bankInfo ? "ویرایش حساب" : "افزودن حساب"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="space-y-8"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset
							className="grid grid-cols-12 gap-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>
											عنوان حساب<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="bankName"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>
											نام بانک<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="bankBranch"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>شعبه بانک</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="bankAccountOwner"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>نام صاحب حساب</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="bankAccountNumber"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>شماره حساب</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												mask={/^\d+$/}
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="bankCardNumber"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>
											شماره کارت<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												mask={/^\d+$/}
												maxLength={16}
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="bankSheba"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>شماره شبا</FormLabel>
										<FormControl>
											<Input
												className="tracking-wider rtl:text-right"
												dir="ltr"
												maxLength={26}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert className="col-span-full">
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<DialogFooter>
							<Button className="min-w-24" type="submit" variant="primary">
								{payload.bankInfo ? "ویرایش" : "افزودن"}
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={onClose.bind(null, undefined)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default UserBankInfoUpsertDialog;
