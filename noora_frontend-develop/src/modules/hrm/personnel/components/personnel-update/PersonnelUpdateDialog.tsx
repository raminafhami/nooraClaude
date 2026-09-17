"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { updatePersonnel } from "@/hrm/personnel/services/updatePersonnel";
import { AcademicDegree } from "@/hrm/shared/models/AcademicDegree";
import updateUser from "@/identity/users/services/updateUser";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import { PersonnelUpsertDegreeWidget } from "../PersonnelUpsertDegreeWidget";

const formSchema = z.object({
	firstname: z.string().min(1, messages.validation.required),
	lastname: z.string().min(1, messages.validation.required),
	fatherName: z.string().min(1, messages.validation.required),
	nationalCode: z.string().min(1, messages.validation.required),
	birthCertificateNo: z.string().min(1, messages.validation.required),
	birthDate: z.string().min(1, messages.validation.required),
	birthPlace: z.string().min(1, messages.validation.required),
	username: z.string().min(1, messages.validation.required),
	phoneNo: z
		.string()
		.refine((value) => value.startsWith("09") && value.length === 11, {
			message: "شماره همراه وارد شده نامعتبر است.",
		}),
	internalPhoneNo: z.string(),
	landlineNo: z.string().min(1, messages.validation.required),
	email: z.string(),
	address: z.string().min(1, messages.validation.required),
	academics: z.custom<AcademicDegree[]>().refine((value) => value.length > 0, {
		message: messages.validation.required,
	}),
});

type FormSchema = z.infer<typeof formSchema>;

function PersonnelUpdateDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		personnel: Personnel;
		parentPath: string;
	},
	string | boolean
>) {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			firstname: payload.personnel.firstname,
			lastname: payload.personnel.lastname,
			fatherName: payload.personnel.fatherName,
			nationalCode: payload.personnel.nationalCode,
			birthCertificateNo: payload.personnel.birthCertificateNo,
			birthDate: payload.personnel.birthDate,
			birthPlace: payload.personnel.birthPlace,
			username: payload.personnel.username,
			phoneNo: payload.personnel.phoneNo,
			internalPhoneNo: payload.personnel.internalPhoneNo ?? "",
			landlineNo: payload.personnel.landlineNo ?? "",
			email: payload.personnel.email,
			address: payload.personnel.address,
			academics: payload.personnel.academics ?? [],
		},
	});

	const {
		control,
		setError,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
	} = form;

	async function handleSubmit(data: FormSchema) {
		try {
			await updatePersonnel(payload.personnel.userId, {
				academics: data.academics,
				address: data.address,
				birthCertificateNo: data.birthCertificateNo,
				birthDate: data.birthDate,
				birthPlace: data.birthPlace,
				fatherName: data.fatherName,
				landlineNo: data.landlineNo || null,
				internalPhoneNo: data.internalPhoneNo || "",
			});

			await updateUser(payload.personnel.userId, {
				username: data.username,
				nationalCode: data.nationalCode,
				name: data.firstname,
				lastname: data.lastname,
				email: data.email || null,
				phoneNo: data.phoneNo,
			});

			toast.success(
				`اطلاعات ${payload.personnel.fullname} با موفقیت بروزرسانی شد.`,
			);

			onClose(true);
		} catch (err) {
			setError("root.server", {
				message: "خطای نامشخصی در هنگام بروزرسانی اطلاعات پرسنل رخ داد.",
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
					<DialogTitle>
						{payload.parentPath === "profile"
							? "ویرایش اطلاعات "
							: "ویرایش پرسنل"}
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
							<div className="col-span-full flex items-center gap-3">
								<span>اطلاعات هویتی</span>
								<Separator className="h-0.5 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="firstname"
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
											<Input className="rtl:text-right" dir="ltr" {...field} />
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
											<Input className="rtl:text-right" dir="ltr" {...field} />
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
							<Button className="min-w-24" type="submit" variant="primary">
								<Spinner loading={isSubmitting || isSubmitSuccessful}>
									بروزرسانی
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
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default PersonnelUpdateDialog;
