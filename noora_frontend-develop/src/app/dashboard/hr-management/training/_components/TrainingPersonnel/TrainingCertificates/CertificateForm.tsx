"use client";

import moment from "moment-jalaali";
import { memo, useContext, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { ExpertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { createExpertiseCertificate } from "@/hrm/personnelExpertise/services/createExpertiseCertificate";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

import { TrainingContext } from "../TrainingContext";
import { CertificatesContext } from "./CertificatesContext";

const schema = z.object({
	organizationName: z
		.string({ required_error: messages.validation.required })
		.min(1, { message: messages.validation.required }),
	certificateDate: z
		.string({ required_error: messages.validation.required })
		.min(1, { message: messages.validation.required }),
	certificateFile: z.custom<File>((v) => v, {
		message: "انتخاب فایل تصویر گواهی الزامی است.",
	}),
});

type FormData = z.infer<typeof schema>;

const defaultValues: Partial<FormData> = {
	organizationName: "",
	certificateDate: "",
	certificateFile: undefined,
};

// Certificate of the one training item the dialog was opened for (its name
// is filled in); saving it makes the item "دارد".
export const CertificateForm = memo(function CertificateForm() {
	const { personnel, updateExpertise } = useContext(TrainingContext);

	const {
		personnel: person,
		item,
		addCertificate,
		removeCertificate,
	} = useContext(CertificatesContext);

	const {
		control,
		formState,
		handleSubmit: onSubmit,
		reset,
		setError,
		watch,
	} = useForm<FormData>({
		defaultValues,
		resolver: zodResolver(schema),
	});

	const { errors, isSubmitting, isSubmitSuccessful } = formState;

	const { certificateFile } = watch();

	const fileInp = useRef<HTMLInputElement | null>(null);

	// the row as it is now (it changes while the dialog is open)
	const row = item
		? (personnel
				.find((x) => x.id === person?.id)
				?.expertises?.find((x) => x.id === item.id) ?? item)
		: null;
	const hasCertificate =
		row?.status === PersonnelExpertiseStatus.Qualified && !!row.certificate?.id;

	async function handleSubmit(data: FormData) {
		if (!person || !row) return;
		try {
			const date = moment(data.certificateDate, "jYYYY/jMM/jDD").toISOString();

			// The backend attaches the certificate to the row and makes it دارد.
			const created = await createExpertiseCertificate({
				userId: person.userId,
				expertiseId: row.expertiseId,
				status: "qualified",
				organizationName: data.organizationName,
				certificateDate: date,
				file: data.certificateFile,
			});
			const saved: PersonnelExpertise = {
				...row,
				id: created.id,
				status: created.status,
				certificateId: created.certificateId ?? undefined,
				certificate: {
					id: created.certificateId!,
					organizationName: data.organizationName,
					certificateDate: date,
				},
			};

			updateExpertise(person.id, {
				id: saved.id,
				userId: person.userId,
				expertiseId: saved.expertiseId,
				status: saved.status!,
				modifyAt: null,
				modifyBy: null,
				certificateId: saved.certificateId,
				certificate: saved.certificate,
			});
			removeCertificate(saved.id);
			addCertificate(person.id, { ...saved, type: ExpertiseType.Certificate });

			toast.success("گواهینامه آموزشی مورد نظر با موفقیت افزوده شد.");
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی رخ داد.",
			});
		}
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset(defaultValues);
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<div className="col-span-4 space-y-6">
			<Head.Root>
				<Head.Title text="افزودن گواهینامه آموزشی" />
			</Head.Root>

			{errors.root && (
				<DestructiveAlert>
					<AlertDescription>{errors.root.message}</AlertDescription>
				</DestructiveAlert>
			)}

			{hasCertificate && (
				<div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
					گواهینامه «{row?.title}» ثبت شده است. برای جایگزینی، ابتدا آن را از
					لیست کنار حذف کنید.
				</div>
			)}

			<form
				className={cn("space-y-12", hasCertificate && "hidden")}
				onSubmit={onSubmit(handleSubmit)}
			>
				<div className="grid gap-x-10 gap-y-6 xl:grid-cols-3 2xl:grid-cols-3">
					<div className="col-span-3 col-start-1 flex">
						<label className="basis-32 pt-2" htmlFor="expertise">
							نام دوره آموزشی:
						</label>
						<div className="grow">
							<Input
								className="bg-gray-50"
								id="expertise"
								readOnly
								value={item?.title ?? ""}
							/>
						</div>
					</div>

					<div className="col-span-3 col-start-1 flex">
						<label className="basis-32 pt-2" htmlFor="organizationName">
							نام سازمان گواهی دهنده:
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="organizationName"
								render={({ field, fieldState }) => (
									<>
										<Input id={field.name} {...field} />
										<FieldError error={fieldState.error} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="col-span-3 col-start-1 flex">
						<label className="basis-32 pt-2" htmlFor="certificateDate">
							تاریخ صدور گواهی:
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="certificateDate"
								render={({
									field: { onBlur, onChange, ...field },
									fieldState,
								}) => (
									<>
										<DateInput
											id={field.name}
											onLeave={onBlur}
											onMutate={onChange}
											{...field}
										/>
										<FieldError error={fieldState.error} />
									</>
								)}
							/>
						</div>
					</div>

					<div className="col-span-3 col-start-1 flex">
						<label className="shrink-0 basis-32 pt-2" htmlFor="certificateFile">
							تصویر گواهی:
						</label>
						<div className="min-w-0 grow">
							<div className="flex w-full items-center gap-3">
								<Button
									className="w-fit shrink-0"
									type="button"
									variant="secondary"
									onClick={() => {
										fileInp.current?.click();
									}}
								>
									انتخاب فایل
								</Button>

								{certificateFile && (
									<div className="truncate">{certificateFile.name}</div>
								)}
							</div>

							<Controller
								control={control}
								name="certificateFile"
								render={({
									field: { ref, value, onBlur, onChange, ...field },
									fieldState,
								}) => (
									<>
										<Input
											className="hidden"
											id={field.name}
											ref={fileInp}
											type="file"
											onChange={(event) => onChange(event.target.files?.[0])}
											{...field}
										/>
										<FieldError error={fieldState.error} />
									</>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="ms-32">
					<Button
						className="min-w-24"
						disabled={isSubmitting || isSubmitSuccessful}
						variant="primary"
					>
						{isSubmitting && <Loading size="xs" />}
						<span>ثبت</span>
					</Button>
				</div>
			</form>
		</div>
	);
});
