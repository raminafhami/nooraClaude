"use client";

import { useRouter } from "next/navigation";
import { isShebaValid, verifyCardNumber } from "persian-tools";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { buyerReferralSourceOptions } from "@/buyers/enums/BuyerReferralSource";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { addUserBankInfo } from "@/identity/users/services/addUserBankInfo";
import createUser from "@/identity/users/services/createUser";
import { useIndustryData } from "@/industries/hooks/useIndustryData";
import {
	CustomerRelation,
	CustomerRelationStatus,
} from "@/inspection/customers/interfaces/CustomerRelation";
import { messages } from "@/messages";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";
import { zodResolver } from "@hookform/resolvers/zod";

const creatorRoleOptions = [
	{
		label: "هماهنگ کننده",
		value: "coordinator",
	},
	{
		label: "بازاریاب",
		value: "marketer",
	},
	{
		label: "هماهنگ کننده و بازاریاب",
		value: "coordinator-marketer",
	},
	{
		label: "هیچ کدام",
		value: "none",
	},
] as const;

const moneyReturnOptions = [
	{ label: "دارد", value: true },
	{ label: "ندارد", value: false },
];

function CustomerCreateDialog({
	open,
	onClose,
}: DialogProps<undefined, boolean | undefined>) {
	const router = useRouter();

	const { identity } = useLoggedInUser();

	const formSchema = useMemo(
		() =>
			z
				.object({
					creatorRole: z.string().min(1, messages.validation.required),
					name: z.string().min(1, messages.validation.required),
					lastname: z.string().min(1, messages.validation.required),
					nationalCode: z
						.string()
						.refine(
							(value) =>
								!value ||
								(/^\d+$/.test(value) &&
									value.length >= 10 &&
									value.length <= 11),
							messages.validation.invalid("کد ملی"),
						),
					phoneNo: z
						.string()
						.refine(
							(value) => value || identity.branchId,
							messages.validation.required,
						)
						.refine(
							(value) =>
								(value.startsWith("0") && value.length !== 11) ||
								(value.startsWith("+") && value.length < 11),
							messages.validation.invalid("شماره همراه"),
						),
					email: z.string(),
					industryId: z.string(),
					subIndustryId: z.string(),
					referralSource: z.string(),
					moneyReturn: z.boolean(),
					title: z.string(),
					bankName: z.string(),
					bankBranch: z.string(),
					bankAccountOwner: z.string(),
					bankAccountNumber: z.string(),
					bankCardNumber: z
						.string()
						.refine(
							(value) =>
								!value || (value.length === 16 && verifyCardNumber(+value)),
							"شماره کارت وارد شده نامعتبر است.",
						),
					bankSheba: z
						.string()
						.refine(
							(value) => !value || (value.length === 26 && isShebaValid(value)),
							"شماره شبا وارد شده نامعتبر است.",
						),
					sepidarId: z.string(),
				})
				.superRefine(
					({ moneyReturn, title, bankName, bankCardNumber }, ctx) => {
						const values = [title, bankName, bankCardNumber].map((v) =>
							v.trim(),
						);
						const filledCount = values.filter(Boolean).length;

						if (moneyReturn && filledCount < values.length) {
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
					},
				),
		[identity.branchId],
	);

	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		defaultValues: {
			creatorRole: "",
			name: "",
			lastname: "",
			nationalCode: "",
			phoneNo: "",
			email: "",
			industryId: "",
			subIndustryId: "",
			referralSource: "",
			moneyReturn: undefined,
			title: "حساب پیش فرض",
			bankName: "",
			bankBranch: "",
			bankAccountOwner: "",
			bankAccountNumber: "",
			bankCardNumber: "",
			bankSheba: "",
			sepidarId: "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		setError,
		setValue,
		watch,
	} = form;

	const { industryId, moneyReturn } = watch();

	async function handleSubmit(data: FormSchema) {
		try {
			let relations: CustomerRelation[] = [];
			if (data.creatorRole !== "none") {
				relations.push({
					coordinator:
						data.creatorRole === "coordinator" ||
						data.creatorRole === "coordinator-marketer"
							? identity.id
							: null,
					marketer:
						data.creatorRole === "marketer" ||
						data.creatorRole === "coordinator-marketer"
							? identity.id
							: null,
					createAt: new Date(),
					deactiveAt: null,
					status: CustomerRelationStatus.Active,
				});
			}

			const createdCustomer = await createUser({
				branchId: identity.branchId,
				name: data.name,
				lastname: data.lastname,
				nationalCode: data.nationalCode,
				phoneNo: data.phoneNo,
				industryId: data.industryId,
				subIndustryId: data.subIndustryId,
				referralSource: data.referralSource,
				email: data.email,
				sepidarId: data.sepidarId,
				metadata: {
					moneyReturn: data.moneyReturn,
					relations,
				},
			});

			if (data.title) {
				try {
					await addUserBankInfo(createdCustomer.id, {
						title: data.title,
						bankAccountNumber: data.bankAccountNumber,
						bankCardNumber: data.bankCardNumber,
						bankName: data.bankName,
						bankSheba: data.bankSheba,
						bankAccountOwner: data.bankAccountOwner,
						bankBranch: data.bankBranch,
					});
				} catch (err) {
					toast.error("خطای نامشخصی در هنگام ثبت اطلاعات حساب بانکی رخ داد.");
				}
			}

			router.push(
				getDynamicUrl(`/dashboard/contacts/customers/${createdCustomer.id}`),
			);
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

	const { industries, subIndustries } = useIndustryData(industryId);

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-md"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>افزودن مشتری جدید</DialogTitle>
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
								name="creatorRole"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>
											نقش من<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Select onValueChange={onChange} {...field}>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{creatorRoleOptions.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label}
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
								<span>اطلاعات پایه</span>
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
								name="nationalCode"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>کد ملی</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask={/^\d+$/}
												maxLength={11}
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
								name="phoneNo"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>
											شماره همراه
											{!identity.branchId && (
												<span className="text-red-600"> *</span>
											)}
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask={/^(0\d{0,10}|\+\d{0,13})$/}
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
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>پست الکترونیک</FormLabel>
										<FormControl>
											<Input className="rtl:text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="col-span-full flex items-center gap-3">
								<span>اطلاعات صنعت</span>
								<Separator className="h-0.5 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="industryId"
								render={({ field: { ref, value, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>صنعت</FormLabel>
										<FormControl>
											<Select
												value={value ?? ""}
												onValueChange={(value) => {
													onChange(value !== "clear" ? value : "");
													setValue("subIndustryId", "");
												}}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{value && <SelectItem value="clear">-</SelectItem>}

													{industries.map((item) => (
														<SelectItem key={item.id} value={item.id}>
															{item.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="subIndustryId"
								render={({ field: { ref, value, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>زیرصنعت</FormLabel>
										<FormControl>
											<Select
												value={value ?? ""}
												onValueChange={(value) => {
													onChange(value !== "clear" ? value : "");
												}}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{value && <SelectItem value="clear">-</SelectItem>}

													{subIndustries.map((item) => (
														<SelectItem key={item.id} value={item.id}>
															{item.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="referralSource"
								render={({ field: { ref, value, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>نحوه آشنایی</FormLabel>
										<FormControl>
											<Select
												value={value ?? ""}
												onValueChange={(value) => {
													onChange(value !== "clear" ? value : "");
												}}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{value && <SelectItem value="clear">-</SelectItem>}

													{buyerReferralSourceOptions.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label}
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
								<span>اطلاعات بانکی</span>
								<Separator className="h-0.5 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="moneyReturn"
								render={({ field: { ref, value, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>بازگشت هزینه به مشتری</FormLabel>
										<FormControl>
											<Select
												value={value?.toString() ?? ""}
												onValueChange={(value) => {
													onChange(value === "true");
												}}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{moneyReturnOptions.map((item) => (
														<SelectItem
															key={item.value.toString()}
															value={item.value.toString()}
														>
															{item.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{moneyReturn && (
								<>
									<FormField
										control={control}
										name="title"
										render={({ field }) => (
											<FormItem className="col-span-full !col-start-1 sm:col-span-6">
												<FormLabel>
													عنوان حساب<span className="text-red-600"> *</span>
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
													نام بانک<span className="text-red-600"> *</span>
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
													شماره کارت<span className="text-red-600"> *</span>
												</FormLabel>
												<FormControl>
													<MaskInput
														className="tracking-wider rtl:text-right"
														dir="ltr"
														inputRef={ref}
														mask={/^\d+$/}
														maxLength={16}
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
								</>
							)}

							<div className="col-span-full flex items-center gap-3">
								<span>اطلاعات تکمیلی</span>
								<Separator className="h-0.5 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="sepidarId"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-6">
										<FormLabel>شناسه سپیدار</FormLabel>
										<FormControl>
											<Input {...field} />
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
								<Spinner
									loading={isSubmitting || isSubmitSuccessful}
									color="white"
									size="sm"
								>
									افزودن
								</Spinner>
							</Button>

							<DialogTrigger asChild>
								<Button type="button" variant="ghost">
									بازگشت
								</Button>
							</DialogTrigger>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default CustomerCreateDialog;
