"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
	BuyerReferralSource,
	buyerReferralSourceOptions,
} from "@/buyers/enums/BuyerReferralSource";
import { BuyerType } from "@/buyers/enums/BuyerType";
import { updateBuyer } from "@/buyers/services/updateBuyer";
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
import { IndustryType } from "@/industries/enums/IndustryType";
import { Industry } from "@/industries/models/Industry";
import { getIndustries } from "@/industries/services/getIndustries";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

import { useBuyerContext } from "../useBuyerContext";

function BuyerInfoForm({ onCancel }: { onCancel: () => void }) {
	const { buyer, handleUpdate } = useBuyerContext();

	const schema = useMemo(
		() =>
			z.object({
				name: z.string().min(1, messages.validation.required),
				nameEn: z.string().min(1, messages.validation.required),
				nationalCode: z
					.string()
					.min(1, messages.validation.required)
					.refine(
						(value) =>
							buyer.type === BuyerType.Natural ? value.length === 10 : true,
						"کد ملی 10 رقمی می باشد.",
					)
					.refine(
						(value) =>
							buyer.type === BuyerType.Legal ? value.length === 11 : true,
						"شناسه ملی 11 رقمی می باشد.",
					),
				registrationNo: z.string(),
				phoneNo: z.string().min(1, messages.validation.required),
				faxNo: z.string(),
				email: z.string(),
				postalCode: z.string().min(1, messages.validation.required),
				address: z.string().min(1, messages.validation.required),
				industryId: z.string().nullable(),
				subIndustryId: z.string().nullable(),
				referralSource: z.custom<BuyerReferralSource>().nullable(),
				sepidarId: z.string(),
			}),
		[buyer.type],
	);

	type FormData = z.infer<typeof schema>;

	const form = useForm<FormData>({
		defaultValues: (() => {
			const phoneNo = Array.isArray(buyer.phoneNo)
				? (buyer.phoneNo.find((x) => x.startsWith("p")) ?? "")
				: buyer.phoneNo;

			const faxNo = Array.isArray(buyer.phoneNo)
				? (buyer.phoneNo.find((x) => x.startsWith("f")) ?? "")
				: "";

			return {
				name: buyer.name,
				nameEn: buyer.nameEn,
				nationalCode: buyer.nationalCode,
				registrationNo: buyer.registrationNo ?? "",
				phoneNo,
				faxNo,
				email: buyer.email ?? "",
				postalCode: buyer.postalCode,
				address: buyer.address,
				industryId: buyer.industryId,
				subIndustryId: buyer.subIndustryId,
				referralSource: buyer.referralSource,
				sepidarId: buyer.sepidarId ?? "",
			};
		})(),
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

	const [industries, setIndustries] = useState<Industry[]>([]);
	const [subIndustries, setSubIndustries] = useState<Industry[]>([]);
	const filteredSubIndustries = useMemo<Industry[]>(() => {
		return industryId
			? subIndustries.filter((x) => x.parentId === industryId)
			: [];
	}, [industryId, subIndustries]);

	async function handleSubmit(values: FormData) {
		try {
			const updatedBuyer = await updateBuyer(buyer.id, {
				name: values.name,
				nameEn: values.nameEn,
				nationalCode: values.nationalCode,
				registrationNo:
					buyer.type === BuyerType.Legal ? values.registrationNo : undefined,
				phoneNo: values.phoneNo,
				faxNo: values.faxNo,
				email: values.email,
				postalCode: values.postalCode,
				address: values.address,
				industryId: values.industryId,
				subIndustryId: values.subIndustryId,
				referralSource: values.referralSource,
				sepidarId: values.sepidarId ?? null,
			});

			toast.success("اطلاعات خریدار با موفقیت بروزرسانی شد.");

			handleUpdate({
				...updatedBuyer,
				industry: updatedBuyer.industryId
					? (industries.find((x) => x.id === updatedBuyer.industryId) ?? null)
					: null,
				subIndustry: updatedBuyer.subIndustryId
					? (subIndustries.find((x) => x.id === updatedBuyer.subIndustryId) ??
						null)
					: null,
			});
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	useEffect(() => {
		(async () => {
			try {
				const industries = await getIndustries();
				setIndustries(industries.filter((x) => x.type === IndustryType.Main));
				setSubIndustries(industries.filter((x) => x.type === IndustryType.Sub));
			} catch (err) {
				console.error(err);
			}
		})();
	}, []);

	useEffect(() => {
		if (isSubmitSuccessful) {
			onCancel();
		}
	}, [isSubmitSuccessful, onCancel]);

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
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>نام فارسی:</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="nameEn"
								render={({ field }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>نام انگلیسی:</FormLabel>
										<FormControl>
											<Input className="text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="nationalCode"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>
											{buyer.type === BuyerType.Natural
												? "کد ملی"
												: "شناسه ملی"}
											:
										</FormLabel>
										<FormControl>
											<MaskInput
												className="text-right tracking-widest"
												dir="ltr"
												inputRef={ref}
												mask={
													!buyer.type || buyer.type === BuyerType.Natural
														? "0000000000"
														: "00000000000"
												}
												unmask
												onAccept={onChange}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{buyer["type"] === BuyerType.Legal && (
								<FormField
									control={control}
									name="registrationNo"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full col-start-1 sm:col-span-6 lg:col-span-4">
											<FormLabel>شماره ثبت:</FormLabel>
											<FormControl>
												<MaskInput
													className="text-right tracking-widest"
													dir="ltr"
													inputRef={ref}
													mask={/\d$/}
													unmask
													onAccept={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="phoneNo"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>شماره تماس:</FormLabel>
										<FormControl>
											<MaskInput
												className="text-right tracking-wider"
												dir="ltr"
												inputRef={ref}
												mask={[
													{
														mask: "@#000000000",
														definitions: { "@": /0/, "#": /9/ },
													},
													{ mask: "@00-00000000", definitions: { "@": /0/ } },
												]}
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
								name="faxNo"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>شماره فکس:</FormLabel>
										<FormControl>
											<MaskInput
												className="text-right tracking-wider"
												definitions={{ "@": /0/ }}
												dir="ltr"
												inputRef={ref}
												mask="@00-00000000"
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
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>پست الکترونیک:</FormLabel>
										<FormControl>
											<Input className="text-right" dir="ltr" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="postalCode"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>کد پستی:</FormLabel>
										<FormControl>
											<MaskInput
												className="text-right tracking-widest"
												dir="ltr"
												inputRef={ref}
												mask="00000-00000"
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
								name="address"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 lg:col-span-8">
										<FormLabel>آدرس:</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="industryId"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>صنعت:</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={(value) => {
													field.onChange(value);
													setValue("subIndustryId", null);
												}}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
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
								render={({ field }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>زیرصنعت:</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={field.onChange}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{filteredSubIndustries.map((x) => (
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
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>نحوه آشنایی:</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={field.onChange}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{buyerReferralSourceOptions.map((x) => (
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

							<Separator className="col-span-full" />

							<FormField
								control={control}
								name="sepidarId"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6 lg:col-span-4">
										<FormLabel>شناسه سپیدار:</FormLabel>
										<FormControl>
											<MaskInput
												className="text-right tracking-widest"
												dir="ltr"
												inputRef={ref}
												mask={/\d$/}
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

						<div className="flex gap-3">
							<Button disabled={!isDirty} variant="primary">
								<span>بروزرسانی</span>
								{isSubmitting && <Loading intent="white" size="xs" />}
							</Button>

							<Button variant="ghost" onClick={() => onCancel()}>
								انصراف
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</CardContent>
	);
}

export { BuyerInfoForm };
