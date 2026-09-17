"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import getCompanyDetails from "@/api/rasmio/getCompanyDetails";
import getCompanyDetailsByPersonalId from "@/api/rasmio/getCompanyDetailsByPersonalId";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	BuyerReferralSource,
	buyerReferralSourceOptions,
} from "@/buyers/enums/BuyerReferralSource";
import { BuyerType } from "@/buyers/enums/BuyerType";
import { Buyer } from "@/buyers/models/Buyer";
import { createBuyer } from "@/buyers/services/createBuyer";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
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
import { IndustryType } from "@/industries/enums/IndustryType";
import { Industry } from "@/industries/models/Industry";
import { getIndustries } from "@/industries/services/getIndustries";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	name: z.string().min(1, messages.validation.required),
	nameEn: z.string().min(1, messages.validation.required),
	registrationNo: z.string(),
	phoneNo: z.string().min(1, messages.validation.required),
	faxNo: z.string(),
	email: z.string(),
	postalCode: z.string().min(1, messages.validation.required),
	address: z.string().min(1, messages.validation.required),
	industryId: z.string().nullable(),
	subIndustryId: z.string().nullable(),
	referralSource: z.custom<BuyerReferralSource>().nullable(),
});

type FormData = z.infer<typeof schema>;

interface Props {
	buyer: Pick<Buyer, "type" | "nationalCode">;
	onCreate?: (buyer: Buyer) => void;
	onClose: () => void;
}

function BuyerCreateNewForm({
	buyer: { nationalCode, type },
	onCreate,
	onClose,
}: Props) {
	const { identity } = useLoggedInUser();

	const form = useForm<FormData>({
		defaultValues: {
			name: "",
			nameEn: "",
			registrationNo: "",
			phoneNo: "",
			faxNo: "",
			email: "",
			postalCode: "",
			address: "",
			industryId: null,
			subIndustryId: null,
			referralSource: null,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
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

	async function loadRasmioInformation() {
		try {
			let res;
			if (type === BuyerType.Legal) {
				res = await getCompanyDetails({
					companyId: nationalCode as string,
					projection:
						"title,registrationNo,email,mobile,fax,postalCode,address,tel",
				});
			} else {
				res = await getCompanyDetailsByPersonalId({
					personId: nationalCode as string,
					projection:
						"title,registrationNo,email,mobile,fax,postalCode,address,tel",
				});
			}

			setValue("name", res?.result?.title || "");
			// setValue("nameEn", res?.result?.title || "");
			setValue("registrationNo", res?.result?.registrationNo || "");
			setValue("phoneNo", res?.result?.mobile || res?.result?.tel || "");
			setValue("faxNo", res?.result?.fax || "");
			setValue("address", res?.result?.address || "");
			setValue("postalCode", res?.result?.postalCode || "");
			setValue("email", res?.result?.email || "");
		} catch (err) {
			console.error(err);
			toast.warning("اطلاعات خریدار مورد نظر در رسمیو یافت نشد.");
		}
	}

	async function handleSubmit(values: FormData) {
		const { faxNo, email, registrationNo, ...data } = values;

		try {
			const createdBuyer = await createBuyer({
				branchId: identity.branchId,
				type,
				nationalCode,
				registrationNo: type === BuyerType.Legal ? registrationNo : undefined,
				faxNo: faxNo || null,
				email: email || null,
				...data,
			});

			onClose();
			onCreate?.(createdBuyer);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
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

	return (
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
					<div>
						<Button
							className="w-full xs:w-auto"
							type="button"
							variant="secondary"
							onClick={() => loadRasmioInformation()}
						>
							دریافت اطلاعات از رسمیو
						</Button>
					</div>

					<div className="grid grid-cols-12 gap-6">
						<FormField
							control={control}
							name="name"
							render={({ field }) => (
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
									<FormLabel>نام (به فارسی):</FormLabel>
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
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
									<FormLabel>نام (به انگلیسی):</FormLabel>
									<FormControl>
										<Input className="text-right" dir="ltr" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{type === BuyerType.Legal && (
							<FormField
								control={control}
								name="registrationNo"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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
								shouldUnregister
							/>
						)}

						<FormField
							control={control}
							name="phoneNo"
							render={({ field: { ref, onChange, ...field } }) => (
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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
								<FormItem className="col-span-full !col-start-1 sm:col-span-9">
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
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
									<FormLabel>کدپستی:</FormLabel>
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
								<FormItem className="col-span-full col-start-1">
									<FormLabel>آدرس:</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="industryId"
							render={({ field }) => (
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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
								<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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
					</div>

					{errors.root?.server && (
						<DestructiveAlert>
							<AlertDescription>{errors.root.server.message}</AlertDescription>
						</DestructiveAlert>
					)}

					<div className="flex gap-3">
						<Button className="min-w-full xs:min-w-32" variant="primary">
							افزودن
							{isSubmitting && <Loading size="xs" />}
						</Button>

						<Button
							className="w-full xs:w-auto"
							type="button"
							variant="ghost"
							onClick={onClose}
						>
							انصراف
						</Button>
					</div>
				</fieldset>
			</form>
		</Form>
	);
}

export { BuyerCreateNewForm };
