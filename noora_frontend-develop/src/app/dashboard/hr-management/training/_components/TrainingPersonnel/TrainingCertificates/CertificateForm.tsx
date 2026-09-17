"use client";

import moment from "moment-jalaali";
import { memo, useContext, useEffect, useRef, useState } from "react";
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
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { getExpertises } from "@/hrm/expertises/services/getExpertises";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { createExpertiseCertificate } from "@/hrm/personnelExpertise/services/createExpertiseCertificate";
import { updatePersonnelCertificate } from "@/hrm/personnelExpertise/services/updatePersonnelCertificate";
import { messages } from "@/messages";
import Autocomplete from "@/ui/Autocomplete/Autocomplete";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils/Comparators";
import { zodResolver } from "@hookform/resolvers/zod";

import { TrainingContext } from "../TrainingContext";
import { CertificatesContext } from "./CertificatesContext";

const schema = z.object({
	expertise: z.custom<Expertise>((v) => v, {
		message: messages.validation.required,
	}),
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
	expertise: undefined,
	organizationName: "",
	certificateDate: "",
	certificateFile: undefined,
};

export const CertificateForm = memo(function CertificateForm() {
	const { personnel, addExpertise, updateExpertise } =
		useContext(TrainingContext);

	const {
		personnel: person,
		certificates,
		addCertificate,
	} = useContext(CertificatesContext);

	const [expertises, setExpertises] = useState<Expertise[]>([]);
	const searchTimeout = useRef<NodeJS.Timeout>();
	async function loadExpertises(value: string) {
		clearTimeout(searchTimeout.current);

		await new Promise((resolve) => {
			searchTimeout.current = setTimeout(async () => {
				if (!value) {
					setExpertises([]);
					resolve(null);
					return;
				}

				const expertises = await getExpertises({
					filters: {
						title: {
							$regex: value,
							$options: "i",
						},
						type: "certificate",
					},
				});

				setExpertises(
					expertises.filter(
						(x) => !certificates.find((y) => y.expertiseId === x.id),
					),
				);

				resolve(null);
			}, 500);
		});
	}

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

	async function handleSubmit(data: FormData) {
		try {
			const expertise = personnel
				.find((x) => x.id === person?.id)
				?.expertises?.find((x) => x.expertiseId === data.expertise.id);

			const date = moment(data.certificateDate, "jYYYY/jMM/jDD").toISOString();

			if (!expertise) {
				const createdExpertise = await createExpertiseCertificate({
					userId: person!.userId,
					expertiseId: data.expertise.id,
					status: "qualified",
					organizationName: data.organizationName,
					certificateDate: date,
					file: data.certificateFile,
				});

				const expertise: PersonnelExpertise = {
					id: createdExpertise.id,
					expertiseId: createdExpertise.expertiseId,
					status: createdExpertise.status,
					title: data.expertise.title,
					type: data.expertise.type,
					certificate: {
						id: createdExpertise.certificateId!,
						organizationName: data.organizationName,
						certificateDate: date,
					},
				};

				addExpertise(person!.id, expertise);
				addCertificate(person!.id, expertise);

				reset(undefined);
			} else {
				const updatedExpertise = await updatePersonnelCertificate(
					expertise.id,
					{
						organizationName: data.organizationName,
						certificateDate: date,
						certificateFile: data.certificateFile as File,
					},
				);

				updateExpertise(person!.id, {
					id: updatedExpertise.id,
					userId: person!.userId,
					expertiseId: updatedExpertise.expertiseId,
					status: updatedExpertise.status,
					modifyAt: null,
					modifyBy: null,
					certificateId: updatedExpertise.certificateId as string,
					certificate: {
						id: updatedExpertise.certificateId!,
						organizationName: data.organizationName,
						certificateDate: date,
					},
				});

				addCertificate(person!.id, {
					id: updatedExpertise.id,
					expertiseId: updatedExpertise.expertiseId,
					status: updatedExpertise.status,
					certificateId: updatedExpertise.certificateId as string,
					type: ExpertiseType.Certificate,
					title: expertise.title,
					certificate: {
						id: updatedExpertise.certificateId!,
						organizationName: data.organizationName,
						certificateDate: date,
					},
				});
			}

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

			<form className="space-y-12" onSubmit={onSubmit(handleSubmit)}>
				<div className="grid gap-x-10 gap-y-6 xl:grid-cols-3 2xl:grid-cols-3">
					<div className="col-span-3 col-start-1 flex">
						<label className="basis-32 pt-2" htmlFor="expertise">
							نام دوره آموزشی:
						</label>
						<div className="grow">
							<Controller
								control={control}
								name="expertise"
								render={({ field, fieldState }) => (
									<>
										<Autocomplete<Expertise>
											compareFn={compareById}
											id={field.name}
											items={expertises}
											label={(x) => x.title}
											onInput={loadExpertises}
											{...field}
										/>
										<FieldError error={fieldState.error} />
									</>
								)}
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
						<span>افزودن</span>
					</Button>
				</div>
			</form>
		</div>
	);
});
