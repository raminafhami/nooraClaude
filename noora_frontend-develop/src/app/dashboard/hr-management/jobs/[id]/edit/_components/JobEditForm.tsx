"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { FaTimes } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import {
  ExpertiseType,
  expertiseTypeOptions,
} from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { createExpertise } from "@/hrm/expertises/services/createExpertise";
import { getExpertises } from "@/hrm/expertises/services/getExpertises";
import { JobDepartment, jobDepartments, JobService } from "@/hrm/jobs";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface Props {
	id: string;
}

export interface FormData {
	code: string;
	name: string;
	department: JobDepartment | null;
	supervisor: string;
	definition: string;
	duties: string[];
	authorities: string[];
	requirements: {
		degree: Partial<{ level: string; name: string; field: string }>[];
		experience: Partial<{ related: string; unrelated: string }>;
		expertises: Expertise[];
		description: string;
	};
	metadata: any;
}

export function JobEditForm({ id }: Props) {
	const router = useRouter();

	const [isLoading, setLoading] = useState<boolean>(true);

	const form = useForm<FormData>({
		defaultValues: {
			duties: [],
			authorities: [],
			requirements: {
				degree: [],
				experience: {},
				expertises: [],
			},
			metadata: {},
		},
		mode: "onTouched",
	});
	const {
		control,
		formState,
		handleSubmit,
		register,
		reset,
		resetField,
		setError,
		setValue,
		trigger,
		unregister,
		watch,
	} = form;
	const { errors, isSubmitting, isSubmitSuccessful } = formState;
	const fields = watch();

	useEffect(() => {
		register("department");

		register("metadata");
	});

	useEffect(() => {
		(async () => {
			setLoading(true);
			const { id: z, ...job } = await JobService.getById(id);

			reset({
				...job,
				requirements: {
					...job.requirements,
					expertises: job.requirements.expertises as Expertise[],
				},
			});

			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		if (fields["department"] !== JobDepartment.GoodsInpection) {
			unregister("metadata.goodsInspectionField");
			resetField("metadata", { defaultValue: {} });
		}
	}, [fields["department"]]);

	if (isLoading) {
		return <Loading size="sm">در حال بارگذاری اطلاعات...</Loading>;
	}

	console.log(fields);

	return (
		<FormProvider {...form}>
			<form
				onSubmit={handleSubmit(async (data) => {
					try {
						data.requirements.expertises = await Promise.all(
							data.requirements.expertises.map((expertice) =>
								expertice.id === ""
									? createExpertise({
											title: expertice.title,
											type: expertice.type,
										})
									: expertice,
							),
						);

						const job = await JobService.update(id, {
							...data,
							requirements: {
								...data.requirements,
								expertises: data.requirements.expertises.map((x) => x.id),
							},
						});
						router.push(getDynamicUrl("/dashboard/hr-management"));
					} catch (err) {
						setError("root.server", { message: "Something went wrong..." });
						setValue("requirements.expertises", data.requirements.expertises);
					}
				})}
			>
				<div className="grid grid-cols-12 gap-x-10 gap-y-6">
					<div className="col-span-3 col-start-1">
						<label htmlFor="code">کد شناسایی:</label>
						<Input
							className="mt-2"
							id="code"
							{...register("code", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["code"]} />
					</div>

					<div className="col-span-3">
						<label htmlFor="name">عنوان شغل:</label>
						<Input
							className="mt-2"
							id="name"
							{...register("name", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["name"]} />
					</div>

					<div className="col-span-3 col-start-1">
						<label htmlFor="department">جایگاه سازمانی:</label>
						<div className="mt-2">
							<Select
								id="department"
								items={jobDepartments}
								optional
								value={fields["department"]}
								onLeave={() => {
									trigger("department");
								}}
								onMutate={(v) => {
									setValue("department", v ?? null, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
							/>
						</div>
						<FieldError error={errors["department"]} />
					</div>

					{fields["department"] === JobDepartment.GoodsInpection && (
						<div className="col-span-3">
							<label htmlFor="metadata.goodsInspectionField">
								حوزه بازرسی کالا:
							</label>
							<Input
								className="mt-2"
								id="metadata.goodsInspectionField"
								{...register("metadata.goodsInspectionField", {
									required: {
										message: messages.validation.required,
										value: true,
									},
								})}
							/>
							<FieldError
								error={(errors["metadata"] as any)?.goodsInspectionField}
							/>
						</div>
					)}

					<div className="col-span-3">
						<label htmlFor="supervisor">گزارش دهی به:</label>
						<Input
							className="mt-2"
							id="supervisor"
							{...register("supervisor", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["supervisor"]} />
					</div>

					<div className="col-span-6 col-start-1">
						<label htmlFor="definition">تعریف شغل:</label>
						<Input
							className="mt-2"
							id="definition"
							{...register("definition", {
								required: {
									message: messages.validation.required,
									value: true,
								},
							})}
						/>
						<FieldError error={errors["definition"]} />
					</div>

					<div className="col-span-full mt-5">
						<div className="h-1 bg-gray-100"></div>
					</div>

					<DegreeWidget />

					<div className="col-span-3 col-start-1">
						<label htmlFor="requirements.experience.related">
							سابقه کاری مرتبط (ماه):
						</label>
						<Input
							className="mt-2"
							id="requirements.experience.related"
							{...register("requirements.experience.related")}
						/>
						<FieldError error={errors["requirements"]?.experience?.related} />
					</div>

					<div className="col-span-3">
						<label htmlFor="requirements.experience.unrelated">
							سابقه کاری غیرمرتبط (ماه):
						</label>
						<Input
							className="mt-2"
							id="requirements.experience.unrelated"
							{...register("requirements.experience.unrelated")}
						/>
						<FieldError error={errors["requirements"]?.experience?.unrelated} />
					</div>

					{expertiseTypeOptions.map((x) => {
						return (
							<ExpertiseWidget label={x.label} key={x.value} type={x.value} />
						);
					})}

					<div className="col-span-6 col-start-1">
						<label htmlFor="requirements.description">توضیحات:</label>
						<Controller
							control={control}
							name="requirements.description"
							render={({ field, fieldState: { error } }) => (
								<>
									<Textarea
										className="mt-2"
										id="requirements.description"
										{...field}
									/>
									<FieldError error={error} />
								</>
							)}
						/>
					</div>

					<div className="col-span-full mt-5">
						<div className="h-1 bg-gray-100"></div>
					</div>

					<DutiesWidget />

					<AuthoritiesWidget />
				</div>

				<div className="mt-12">
					<Button
						disabled={isSubmitting || isSubmitSuccessful}
						variant="primary"
					>
						<span>بروزرسانی اطلاعات</span>
						{isSubmitting && <Loading intent="white" size="xs" />}
					</Button>
				</div>
			</form>
		</FormProvider>
	);
}

function ExpertiseWidget({
	label,
	type,
}: {
	label: string;
	type: ExpertiseType;
}) {
	const [text, setText] = useState<string>("");
	const [searching, setSearching] = useState<boolean>(false);
	const [items, setItems] = useState<Expertise[]>([]);
	const [expertise, setExpertise] = useState<Expertise>();

	const timeout = useRef<NodeJS.Timeout>();
	const textInp = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	const { setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const expertises = fields["requirements"].expertises.filter(
		(x) => x.type === type,
	);

	useEffect(() => {
		setSearching(true);
		clearTimeout(timeout.current);

		if (text) {
			timeout.current = setTimeout(async () => {
				setItems(
					(
						await getExpertises({
							filters: {
								title: { $regex: text, $options: "i" },
								type,
							},
						})
					).filter((x) => !expertises.map((x) => x.title).includes(x.title)),
				);

				setSearching(false);
			}, 150);
		} else {
			setItems([]);
			setSearching(false);
		}
	}, [text]);

	return (
		<>
			<div className="col-span-6 col-start-1 flex flex-col gap-y-2">
				<label htmlFor="expertise">{label}:</label>
				<div className="group flex overflow-hidden rounded-lg border border-gray-200 transition focus-within:border-gray-300">
					<div className="grow">
						<Input
							className="rounded-none border-0 border-e"
							ref={textInp}
							value={text}
							onChange={(e) => {
								setText(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addBtn.current!.click();
								}
							}}
						/>
					</div>

					<Button
						ref={addBtn}
						className="rounded-none border-none"
						disabled={searching || (!expertise && !text)}
						size="lg"
						type="button"
						variant="outline"
						onClick={() => {
							if (expertise) {
								setValue(
									"requirements.expertises",
									[...fields["requirements"].expertises, expertise],
									{
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									},
								);
							} else {
								let expertise = items.find((x) => x.title === text) ?? {
									id: "",
									title: text.trim(),
									type,
								};

								setValue(
									"requirements.expertises",
									[...fields["requirements"].expertises, expertise],
									{
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									},
								);
							}

							setText("");
							setItems([]);
							setExpertise(undefined);
							textInp.current!.focus();
						}}
					>
						افزودن
					</Button>
				</div>

				{text && (
					<div className="flex gap-x-3 rounded-xl bg-gray-100 px-3 py-2">
						<div className="px-2 py-0.5">نتایج:</div>
						<div className="flex grow cursor-pointer flex-col gap-y-1">
							{searching ? (
								<Loading size="sm">در حال بررسی...</Loading>
							) : items.length !== 0 ? (
								items.map((item) => {
									return (
										<div
											className={cn(
												"w-fit select-none rounded-xl px-2 py-0.5 transition",
												expertise?.id === item.id && "bg-gray-200",
											)}
											key={item.id}
											onClick={() => {
												if (item !== expertise) {
													setExpertise(item);
												} else {
													setExpertise(undefined);
												}
											}}
										>
											{item.title}
										</div>
									);
								})
							) : (
								<div className="w-fit select-none rounded-xl px-2 py-0.5 transition">
									نتیجه ای یافت نشد.
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="col-span-6 col-start-1 rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{expertises.length !== 0 ? (
					expertises.map((expertise: Expertise) => (
						<div className="mt-1.5 first:mt-0" key={expertise.title}>
							<div className="flex items-center">
								<div>
									<FaTimes
										className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
										onClick={() => {
											setValue("requirements.expertises", [
												...fields["requirements"].expertises.filter(
													(x) => x.title !== expertise.title,
												),
											]);
										}}
									/>
								</div>

								<div className="ms-2">{expertise.title}</div>
							</div>
						</div>
					))
				) : (
					<div key="empty">-</div>
				)}
			</div>
		</>
	);
}

function DegreeWidget() {
	const [degree, setDegree] = useState<
		Partial<{ level: string; name: string; field: string }>
	>({});

	const levelInp = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	const { setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const degrees = fields["requirements"].degree;

	return (
		<>
			<div className="col-span-6 col-start-1 flex flex-col gap-y-2">
				<label htmlFor="degreeLevel">مدرک تحصیلی:</label>
				<div className="group flex overflow-hidden rounded-lg border border-gray-200 transition focus-within:border-gray-300">
					<Input
						className="rounded-none border-0 border-e"
						id="degreeLevel"
						placeholder="مقطع"
						ref={levelInp}
						value={degree?.level ?? ""}
						onChange={(e) => {
							setDegree((prev) => {
								return { ...prev, level: e.target.value };
							});
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addBtn.current!.click();
							}
						}}
					/>

					<Input
						className="rounded-none border-0 border-e"
						placeholder="رشته"
						value={degree?.name ?? ""}
						onChange={(e) => {
							setDegree((prev) => {
								return { ...prev, name: e.target.value };
							});
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addBtn.current!.click();
							}
						}}
					/>

					<Input
						className="rounded-none border-0 border-e"
						placeholder="گرایش"
						value={degree?.field ?? ""}
						onChange={(e) => {
							setDegree((prev) => {
								return { ...prev, field: e.target.value };
							});
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addBtn.current!.click();
							}
						}}
					/>

					<Button
						ref={addBtn}
						className="rounded-none border-none"
						disabled={!degree.level && !degree.name && !degree.field}
						size="lg"
						type="button"
						variant="outline"
						onClick={() => {
							setValue("requirements.degree", [...degrees, { ...degree }]);
							setDegree({});
							levelInp.current!.focus();
						}}
					>
						افزودن
					</Button>
				</div>
			</div>

			<div className="col-span-6 col-start-1 rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{degrees.length !== 0 ? (
					degrees.map((degree) => (
						<div
							className="mt-1.5 first:mt-0"
							key={`${degree.level}.${degree.name}.${degree.field}`}
						>
							<div className="flex items-center">
								<div>
									<FaTimes
										className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
										onClick={() => {
											setValue("requirements.degree", [
												...fields["requirements"].degree.filter(
													(x) =>
														x.level !== degree.level ||
														x.name !== degree.name ||
														x.field !== degree.field,
												),
											]);
										}}
									/>
								</div>

								<div className="ms-2">
									{degree.level} {degree.name}{" "}
									{degree.field ? `گرایش ${degree.field}` : ""}
								</div>
							</div>
						</div>
					))
				) : (
					<div key="empty">-</div>
				)}
			</div>
		</>
	);
}

function DutiesWidget() {
	const [duty, setDuty] = useState<string>("");

	const dutyInp = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	const { setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const duties = fields["duties"];

	return (
		<>
			<div className="col-span-6 col-start-1 flex flex-col gap-y-2">
				<label htmlFor="duty">شرح وظایف و مسئولیت ها:</label>
				<div className="group flex overflow-hidden rounded-lg border border-gray-200 transition focus-within:border-gray-300">
					<Input
						className="rounded-none border-0 border-e"
						id="duty"
						ref={dutyInp}
						value={duty ?? ""}
						onChange={(e) => {
							setDuty(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addBtn.current!.click();
							}
						}}
					/>

					<Button
						ref={addBtn}
						className="rounded-none border-none"
						disabled={!duty}
						size="lg"
						type="button"
						variant="outline"
						onClick={() => {
							setValue("duties", [...duties, duty!.trim()]);
							setDuty("");
							dutyInp.current!.focus();
						}}
					>
						افزودن
					</Button>
				</div>
			</div>

			<div className="col-span-6 col-start-1 rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{duties && duties.length !== 0 ? (
					duties.map((duty) => (
						<div className="mt-1.5 first:mt-0" key={duty}>
							<div className="flex items-center">
								<div>
									<FaTimes
										className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
										onClick={() => {
											setValue("duties", [
												...fields["duties"].filter((x) => x !== duty),
											]);
										}}
									/>
								</div>

								<div className="ms-2">{duty}</div>
							</div>
						</div>
					))
				) : (
					<div key="empty">-</div>
				)}
			</div>
		</>
	);
}

function AuthoritiesWidget() {
	const [authority, setAuthority] = useState<string>("");

	const authorityInp = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	const { setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const authorities = fields["authorities"];

	return (
		<>
			<div className="col-span-6 col-start-1 flex flex-col gap-y-2">
				<label htmlFor="authority">اختیارات:</label>
				<div className="group flex overflow-hidden rounded-lg border border-gray-200 transition focus-within:border-gray-300">
					<Input
						className="rounded-none border-0 border-e"
						id="authority"
						ref={authorityInp}
						value={authority ?? ""}
						onChange={(e) => {
							setAuthority(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addBtn.current!.click();
							}
						}}
					/>

					<Button
						ref={addBtn}
						className="rounded-none border-none"
						disabled={!authority}
						size="lg"
						type="button"
						variant="outline"
						onClick={() => {
							setValue("authorities", [...authorities, authority!.trim()]);
							setAuthority("");
							authorityInp.current!.focus();
						}}
					>
						افزودن
					</Button>
				</div>
			</div>

			<div className="col-span-6 col-start-1 rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{authorities && authorities.length !== 0 ? (
					authorities.map((authority) => (
						<div className="mt-1.5 first:mt-0" key={authority}>
							<div className="flex items-center">
								<div>
									<FaTimes
										className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
										onClick={() => {
											setValue("authorities", [
												...authorities.filter((x) => x !== authority),
											]);
										}}
									/>
								</div>

								<div className="ms-2">{authority}</div>
							</div>
						</div>
					))
				) : (
					<div key="empty">-</div>
				)}
			</div>
		</>
	);
}
