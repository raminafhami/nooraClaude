"use client";

import { isShebaValid, verifyCardNumber } from "persian-tools";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { getBranches } from "@/branches/services/getBranches";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { createPersonnel } from "@/hrm/personnel/services/createPersonnel";
import { AcademicDegree } from "@/hrm/shared/models/AcademicDegree";
import { addUserBankInfo } from "@/identity/users/services/addUserBankInfo";
import { messages } from "@/messages";
import { SelectItemType } from "@/types/SelectItem";
import { zodResolver } from "@hookform/resolvers/zod";

import { PersonnelUpsertDegreeWidget } from "../PersonnelUpsertDegreeWidget";

const formSchema = z
	.object({
		branchId: z.string(),
		name: z.string().min(1, messages.validation.required),
		lastname: z.string().min(1, messages.validation.required),
		fatherName: z.string().min(1, messages.validation.required),
		nationalCode: z.string().min(1, messages.validation.required),
		birthCertificateNo: z.string().min(1, messages.validation.required),
		birthDate: z.string().min(1, messages.validation.required),
		birthPlace: z.string().min(1, messages.validation.required),
		username: z.string().min(1, messages.validation.required),
		phoneNo: z
			.string()
			.min(1, messages.validation.required)
			.refine((value) => value.startsWith("09") && value.length === 11, {
				message: "شماره همراه وارد شده نامعتبر است.",
			}),
		password: z.string().min(1, messages.validation.required),
		confirmPassword: z.string().min(1, messages.validation.required),
		internalPhoneNo: z.string(),
		landlineNo: z.string().min(1, messages.validation.required),
		email: z.string(),
		address: z.string().min(1, messages.validation.required),
		title: z.string(),
		bankName: z.string(),
		bankBranch: z.string(),
		bankAccountOwner: z.string(),
		bankAccountNumber: z.string(),
		bankCardNumber: z
			.string()
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
		academics: z
			.custom<AcademicDegree[]>()
			.refine((value) => value.length > 0, {
				message: messages.validation.required,
			}),
	})
	.superRefine((data, ctx) => {
		const { title, bankName, bankCardNumber } = data;

		const values = [title, bankName, bankCardNumber].map((v) => v.trim());
		const filledCount = values.filter(Boolean).length;

		if (filledCount > 0 && filledCount < 3) {
			if (!title) {
				ctx.addIssue({
					path: ["title"],
					code: z.ZodIssueCode.custom,
					message: messages.validation.required,
				});
			}

			if (!bankName) {
				ctx.addIssue({
					path: ["bankName"],
					code: z.ZodIssueCode.custom,
					message: messages.validation.required,
				});
			}

			if (!bankCardNumber) {
				ctx.addIssue({
					path: ["bankCardNumber"],
					code: z.ZodIssueCode.custom,
					message: messages.validation.required,
				});
			}
		}
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "رمز عبور و تکرار آن باید یکسان باشند.",
	});

type FormSchema = z.infer<typeof formSchema>;

function PersonnelCreateDialog({
	open,
	onClose,
}: DialogProps<undefined, boolean | undefined>) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [branches, setBranches] = useState<SelectItemType[]>([]);

	useEffect(() => {
		const getAllBranches = async () => {
			try {
				setIsLoading(true);

				const branch = await getBranches();
				const branches = branch.map((branch) => ({
					value: branch.id,
					label: branch.title,
				}));

				setBranches(branches);
			} catch (error) {
				console.error(error);
				toast.error("خطای نامشخصی در هنگام دریافت ");
			} finally {
				setIsLoading(false);
			}
		};

		getAllBranches();
	}, []);

	// form
	const form = useForm<FormSchema>({
		defaultValues: {
			branchId: "",
			name: "",
			lastname: "",
			fatherName: "",
			nationalCode: "",
			birthCertificateNo: "",
			birthDate: "",
			birthPlace: "",
			username: "",
			phoneNo: "",
			password: "",
			confirmPassword: "",
			internalPhoneNo: "",
			landlineNo: "",
			email: "",
			address: "",
			title: "",
			bankName: "",
			bankBranch: "",
			bankAccountOwner: "",
			bankAccountNumber: "",
			bankCardNumber: "",
			bankSheba: "",
			academics: [],
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		setError,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		watch,
	} = form;

	const { title, bankName, bankCardNumber } = watch();

	const isBankInfoRequired =
		title.trim() || bankName.trim() || bankCardNumber.trim();

	async function handleSubmit(values: FormSchema) {
		try {
			const groups: string[] = [];
			if (values.branchId !== "hq") {
				groups.push(values.branchId);
			}

			const createdPersonnel = await createPersonnel({
				...values,
				branchId: values.branchId !== "hq" ? values.branchId : null,
				groups,
			});

			if (values.title) {
				try {
					await addUserBankInfo(createdPersonnel.userId, {
						title: values.title,
						bankAccountNumber: values.bankAccountNumber,
						bankCardNumber: values.bankCardNumber,
						bankName: values.bankName,
						bankSheba: values.bankSheba.toUpperCase(),
						bankAccountOwner: values.bankAccountOwner,
						bankBranch: values.bankBranch,
					});
				} catch {
					toast.error("خطای نامشخصی در هنگام ایجاد حساب بانکی رخ داد.");
				}
			}
			toast.success("پرسنل مورد نظر با موفقیت ایجاد شد.");
			onClose(true);
		} catch (err) {
			let errorMessage: string | undefined;
			if (isApiResponse(err)) {
				if (err.message === "this user is exist.") {
					errorMessage = "کد ملی، شماره همراه و یا ایمیل تکراری است.";
				}
			}

			setError("root.server", {
				message: errorMessage || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-md"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>افزودن پرسنل</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					{isLoading && <Spinner label="در حال دریافت اطلاعات..." size="sm" />}

					{!isLoading && (
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
									name="branchId"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												شعبه<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="hq">مرکزی</SelectItem>
														{branches.map((branch) => (
															<SelectItem
																key={branch.value}
																value={branch.value}
															>
																{branch.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>اطلاعات هویتی</span>
									<Separator className="h-0.5 w-auto grow" />
								</div>

								<FormField
									control={control}
									name="name"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												نام<span className="text-red-600"> *</span>
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
									name="lastname"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												نام خانوادگی<span className="text-red-600"> *</span>
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
									name="fatherName"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												نام پدر<span className="text-red-600"> *</span>
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
									name="nationalCode"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												کد ملی<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputMode="numeric"
													inputRef={ref}
													mask={/^\d+$/}
													maxLength={10}
													unmask
													onAccept={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="birthCertificateNo"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												شماره شناسنامه<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputMode="numeric"
													inputRef={ref}
													mask={/^\d+$/}
													unmask
													onAccept={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="birthDate"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												تاریخ تولد<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<DateInput {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="birthPlace"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												محل تولد<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>اطلاعات کاربری</span>
									<Separator className="h-0.5 w-auto grow" />
								</div>

								<FormField
									control={control}
									name="username"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												نام کاربری<span className="text-red-600"> *</span>
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

								<FormField
									control={control}
									name="phoneNo"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												شماره همراه<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													placeholder="09123456789"
													inputMode="numeric"
													inputRef={ref}
													mask="00000000000"
													unmask
													onAccept={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="password"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												رمز عبور<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input
													className="rtl:text-right"
													dir="ltr"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												تکرار رمز عبور<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input
													className="rtl:text-right"
													dir="ltr"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>اطلاعات تماس</span>
									<Separator className="h-0.5 w-auto grow" />
								</div>

								<FormField
									control={control}
									name="internalPhoneNo"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full sm:col-span-4">
											<FormLabel>شماره داخلی</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputMode="numeric"
													inputRef={ref}
													mask={/^\d+$/}
													unmask
													onAccept={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="landlineNo"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full sm:col-span-4">
											<FormLabel>
												تلفن ثابت<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputMode="numeric"
													inputRef={ref}
													mask={/^\d+$/}
													unmask
													onAccept={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="email"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-4">
											<FormLabel>ایمیل</FormLabel>
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

								<FormField
									control={control}
									name="address"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												آدرس<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>اطلاعات بانکی</span>
									<Separator className="h-0.5 w-auto grow" />
								</div>

								<FormField
									control={control}
									name="title"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												عنوان حساب
												{isBankInfoRequired && (
													<span className="text-red-600"> *</span>
												)}
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
									name="bankName"
									render={({ field }) => (
										<FormItem className="col-span-full !col-start-1 sm:col-span-6">
											<FormLabel>
												نام بانک
												{isBankInfoRequired && (
													<span className="text-red-600"> *</span>
												)}
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
													onAccept={onChange}
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
												شماره کارت
												{isBankInfoRequired && (
													<span className="text-red-600"> *</span>
												)}
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													maxLength={16}
													inputMode="numeric"
													inputRef={ref}
													mask={/^\d+$/}
													unmask
													onAccept={onChange}
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
													className="rtl:text-right"
													dir="ltr"
													maxLength={26}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>
										تحصیلات<span className="text-red-600"> *</span>
									</span>
									<Separator className="h-0.5 w-auto grow" />
								</div>

								<FormField
									control={control}
									name="academics"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormControl>
												<PersonnelUpsertDegreeWidget {...field} />
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
								<Button
									className="min-w-24"
									disabled={isLoading}
									type="submit"
									variant="primary"
								>
									<Spinner
										loading={isSubmitting || isSubmitSuccessful}
										color="white"
										size="sm"
									>
										افزودن
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
						</form>
					)}
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default PersonnelCreateDialog;
