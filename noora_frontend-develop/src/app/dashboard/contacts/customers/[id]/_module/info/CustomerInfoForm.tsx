"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { buyerReferralSourceOptions } from "@/buyers/enums/BuyerReferralSource";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
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
import updateUser from "@/identity/users/services/updateUser";
import { useIndustryData } from "@/industries/hooks/useIndustryData";
import { messages } from "@/messages";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCustomerContext } from "../CustomerContext";

const moneyReturnOptions = [
	{ value: true, label: "دارد" },
	{ value: false, label: "ندارد" },
];

function CustomerInfoForm({ onCancel }: { onCancel: () => void }) {
	const { identity } = useLoggedInUser();

	const { customer, updateCustomer } = useCustomerContext();

	const schema = useMemo(
		() =>
			z.object({
				name: z.string().min(1, messages.validation.required),
				lastname: z.string().min(1, messages.validation.required),
				nationalCode: z
					.string()
					.refine(
						(value) => !value || (/^\d+$/.test(value) && value.length === 10),
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
							!value ||
							(value.startsWith("0") && value.length === 11) ||
							(value.startsWith("+") &&
								value.length >= 11 &&
								value.length <= 13),
						messages.validation.invalid("شماره همراه"),
					),
				email: z.string(),
				moneyReturn: z.boolean(),
				sepidarId: z.string(),
				industryId: z.string().optional(),
				subIndustryId: z.string().optional(),
				referralSource: z.string().optional(),
			}),
		[identity.branchId],
	);

	type FormData = z.infer<typeof schema>;

	const form = useForm<FormData>({
		defaultValues: {
			name: customer.firstname,
			lastname: customer.lastname,
			nationalCode: customer.nationalCode ?? "",
			phoneNo: customer.phoneNo ?? "",
			email: customer.email ?? "",
			moneyReturn: customer.metadata.moneyReturn ?? null,
			sepidarId: customer.sepidarId ?? "",
			industryId: asNavigationProp(customer.industryId)?.id ?? undefined,
			subIndustryId: asNavigationProp(customer.subIndustryId)?.id ?? undefined,
			referralSource: customer.referralSource ?? undefined,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: onSubmit,
		setError,
		setValue,
		watch,
	} = form;

	const { industryId } = watch();

	async function handleSubmit(values: FormData) {
		try {
			const updatedCustomer = await updateUser(customer.id, {
				name: values.name,
				lastname: values.lastname,
				nationalCode: values.nationalCode,
				phoneNo: values.phoneNo,
				email: values.email,
				sepidarId: values.sepidarId,
				industryId: values.industryId,
				subIndustryId: values.subIndustryId,
				referralSource: values.referralSource,
				metadata: {
					moneyReturn: values.moneyReturn,
				},
			});

			toast.success("اطلاعات مشتری با موفقیت بروزرسانی شد.");

			const industry = values.industryId
				? industries.find((i) => i.id === values.industryId)
				: undefined;

			const subIndustry = values.subIndustryId
				? subIndustries.find((i) => i.id === values.subIndustryId)
				: undefined;

			updateCustomer({
				...updatedCustomer,
				industryId: industry ?? (null as any),
				subIndustryId: subIndustry ?? (null as any),
			});

			onCancel();
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	const { industries, subIndustries } = useIndustryData(industryId);

	return (
		<CardContent>
			<Form {...form}>
				<form onSubmit={onSubmit(handleSubmit)}>
					<fieldset
						className="space-y-8"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<div className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="name"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>
											نام<span className="text-red-500"> *</span>
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
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>
											نام خانوادگی<span className="text-red-500"> *</span>
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
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>کد ملی</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wide rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask="0000000000"
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
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>
											شماره همراه
											{!identity.branchId && (
												<span className="text-red-500"> *</span>
											)}
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wide rtl:text-right"
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
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>پست الکترونیک</FormLabel>
										<FormControl>
											<Input className="rtl:text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="industryId"
								render={({ field: { ref, value, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>صنعت</FormLabel>
										<FormControl>
											<Select
												onValueChange={(value) => {
													onChange(value !== "clear" ? value : "");
													setValue("subIndustryId", "");
												}}
												value={value ?? ""}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{value && <SelectItem value="clear">-</SelectItem>}

													{industries.map((x) => (
														<SelectItem key={x.id} value={x.id}>
															{x.name}
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
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>زیرصنعت</FormLabel>
										<FormControl>
											<Select
												onValueChange={(value) => {
													onChange(value !== "clear" ? value : "");
												}}
												value={value ?? ""}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{value && <SelectItem value="clear">-</SelectItem>}

													{subIndustries.map((x) => (
														<SelectItem key={x.id} value={x.id}>
															{x.name}
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
									<FormItem className="col-span-full sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>نحوه آشنایی</FormLabel>
										<FormControl>
											<Select
												value={value}
												onValueChange={(value) => {
													onChange(value !== "clear" ? value : "");
												}}
												{...field}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{value && <SelectItem value="clear">-</SelectItem>}

													{buyerReferralSourceOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="moneyReturn"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>
											بازگشت هزینه به مشتری
											<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												value={field.value.toString() ?? ""}
												onValueChange={(value) => {
													field.onChange(value === "true");
												}}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{moneyReturnOptions.map((x) => (
														<SelectItem
															key={x.value.toString()}
															value={x.value.toString()}
														>
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

							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="sepidarId"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-8 md:col-span-6 lg:col-span-5 2xl:col-span-4">
										<FormLabel>شناسه سپیدار</FormLabel>
										<FormControl>
											<Input className="rtl:text-right" dir="ltr" {...field} />
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

						<div className="flex gap-3">
							<Button disabled={!isDirty} variant="primary">
								<Spinner loading={isSubmitting} color="white" size="sm">
									بروزرسانی
								</Spinner>
							</Button>

							<Button variant="ghost" onClick={onCancel}>
								بازگشت
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</CardContent>
	);
}

export { CustomerInfoForm };
