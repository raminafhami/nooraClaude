"use client";

import moment from "jalali-moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { ContractAddendums } from "@/hrm/contract/components/ContractAddendums";
import { ContractView } from "@/hrm/contract/components/ContractView";
import { Contract } from "@/hrm/contract/models/Contract";
import { getContractById } from "@/hrm/contract/services/getContractById";
import { sendContractOtp } from "@/hrm/contract/services/sendContractOtp";
import { verifyContractOtp } from "@/hrm/contract/services/verifyContractOtp";
import { JobService } from "@/hrm/jobs/JobService";
import { JobDescription } from "@/hrm/jobs/models/Job";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import {
	ReviewStatus,
	reviewStatusOptions,
} from "@/inspection/models/ReviewStatus";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignees";
import { ids } from "../../models/Ids";
import { getUserSignature } from "../../services/getUserSignature";
import { validatePersonnelInformation } from "../../utils/validatePersonnelInformation";
import { schema } from "./TaskSchema";

type FormData = z.infer<typeof schema>;

function TaskPage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { [ids.contractId]: contractId, [ids.assignees]: assignees } =
		task.data;
	const { [AssigneeType.QA]: qaAssignee } = assignees;

	const {
		clearErrors,
		control,
		formState: { errors },
		register,
		setError,
		setValue,
		watch,
	} = useFormContext<FormData>();

	const {
		[ids.contractReviewStatusByPersonnel]: reviewStatus,
		PersonnelOtpVerificationStatus: otpVerification,
	} = watch();

	const {
		PersonnelInformationStatus: informationStatusError,
		PersonnelSignatureStatus: signatureStatusError,
	} = errors;

	const personnelStatusError =
		!!informationStatusError || !!signatureStatusError;

	useEffect(() => {
		register("PersonnelInformationStatus", {
			validate: (value) => {
				if (!value) {
					return "اطلاعات پرسنلی شما کامل نمی باشد.";
				}
			},
		});

		register("PersonnelSignatureStatus", {
			validate: (value) => {
				if (!value) {
					return "امضای شما در سامانه ثبت نشده است.";
				}
			},
		});
	}, [register]);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [contract, setContract] = useState<Contract>();
	const [personnel, setPersonnel] = useState<Personnel>();
	const [jobs, setJobs] = useState<JobDescription[]>();
	const [qaSignature, setQaSignature] = useState<string | undefined>();

	const confirmationStatusLabel = useMemo(() => {
		return `اینجانب ${personnel?.fullname} با شماره ملی ${
			personnel?.nationalCode
		} در تاریخ ${moment(new Date()).format(
			"jYYYY/jMM/jDD",
		)} با انتخاب گزینه (می پذیرم) رضایت خود به مفاد قرارداد را اعلام نموده و تایید می نماینم که تایید دیجیتال به مثابه تمام روش های تاییدیه سابق از جمله امضای مکتوب بوده و معتبر می باشد.`;
	}, [personnel]);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				// load contract
				const contract: Contract = await getContractById(contractId);
				setContract(contract);

				// load personnel
				const personnel = await getPersonnelById(contract.userId, ["user"]);
				setPersonnel(personnel);
				setValue(
					"PersonnelInformationStatus",
					!!validatePersonnelInformation(personnel),
					{ shouldDirty: true, shouldTouch: true, shouldValidate: true },
				);

				// load jobs
				const jobs = await JobService.get({
					filters: [
						{
							name: "_id",
							value: (contract?.jobs as any)?.map((x: any) => x.id),
						},
					],
				});
				setJobs(jobs as JobDescription[]);

				// load qa signature
				const qaSignature = await getUserSignature(qaAssignee.id);
				setQaSignature(qaSignature);

				// load personnel signature
				const personnelSignature = await getUserSignature(personnel.userId);
				setValue("PersonnelSignatureStatus", !!personnelSignature, {
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				});
			} catch (error) {
				console.error(error);
				toast.error("خطا در دریافت اطلاعات!");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [contractId, qaAssignee.id, setValue]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					delete data["PersonnelInformationStatus"];
					delete data["PersonnelSignatureStatus"];
					delete data["PersonnelOtpVerificationStatus"];

					// set assignee
					data[ids.assignees][AssigneeType.Personnel] = {
						id: identity.id,
						name: identity.fullname,
					};

					// set previous task
					data[ids.previousTask] = {
						taskKey: task.key,
						assigneeKey: AssigneeType.Personnel,
						assigneeTitle: assigneesTemplate[AssigneeType.Personnel],
						noteContent: data[ids.contractReviewNoteByPersonnel],
						noteType:
							data[ids.contractReviewStatusByPersonnel] === "forward"
								? "info"
								: "danger",
					};
				},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					await addWatcherToInstance(task.instanceId, identity.id);

					if (
						data[ids.contractReviewStatusByPersonnel] === ReviewStatus.Forward
					) {
						await setStageOfInstance(task.instanceId, "review-by-ceo");
					} else {
						await setStageOfInstance(task.instanceId, "review-by-hr");
					}
				},
			);
		}
	}, [hooks, identity]);

	const [otpCode, setOtpCode] = useState<string>("");
	const [otpTime, setOtpTime] = useState<number>(0);
	const otpTimeInterval = useRef<NodeJS.Timer>();
	const otpTimeBtn = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!otpTime) {
			clearInterval(otpTimeInterval.current);
			clearErrors("PersonnelOtpVerificationStatus");

			if (!otpVerification) {
				setOtpCode("");
			}
		}
	}, [clearErrors, otpTime, otpVerification]);

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!contract || !personnel || !jobs) {
		return <></>;
	}

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{task.data[ids.previousTask] && (
				<>
					<PreviousTaskReferrer />

					<Seperator className="mt-5" />
				</>
			)}

			<div className="col-span-3 col-start-1 space-y-2">
				<label>پرسنل:</label>
				<Input
					defaultValue={task.data[ids.assignees][AssigneeType.Personnel]?.name}
					disabled
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full col-start-1 space-y-2">
				<label>قرارداد:</label>
				<ContractView contract={contract} personnel={personnel} jobs={jobs} />
			</div>

			<ContractAddendums
				className="col-span-full col-start-1"
				contract={contract}
				personnel={personnel}
				jobs={jobs}
				signatures={{
					qa: qaSignature,
				}}
			/>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.contractReviewStatusByPersonnel}>
					نتیجه بررسی:
				</label>
				<Controller
					control={control}
					name={ids.contractReviewStatusByPersonnel}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Select
								id={field.name}
								items={reviewStatusOptions}
								onChange={(value) => {
									onChange(value);
									setOtpTime(0);
								}}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			{reviewStatus === ReviewStatus.Return && (
				<div className="col-span-full space-y-2">
					<label htmlFor={ids.contractReviewNoteByPersonnel}>
						توضیحات بررسی:
					</label>
					<Controller
						control={control}
						name={ids.contractReviewNoteByPersonnel}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								reviewStatus === ReviewStatus.Return &&
								messages.validation.required,
						}}
						shouldUnregister
					/>
				</div>
			)}

			{reviewStatus === ReviewStatus.Forward && (
				<>
					<div className="col-span-full col-start-1 space-y-2">
						<Controller
							control={control}
							name={ids.personnelConfirmationStatus}
							render={({ field, fieldState }) => (
								<>
									<div className="flex items-center gap-2">
										<Checkbox
											checked={Boolean(field.value) && field.value === "true"}
											id={field.name}
											onCheckedChange={(checked) => {
												field.onChange(checked === true ? "true" : "false");
											}}
										/>
										<label htmlFor={field.name}>
											{confirmationStatusLabel}
										</label>
									</div>
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								validate: (value) => {
									if (
										reviewStatus === ReviewStatus.Forward &&
										value !== "true"
									) {
										return "انتخاب این گزینه الزامی می باشد.";
									}
								},
							}}
						/>
					</div>

					<Controller
						control={control}
						name="PersonnelOtpVerificationStatus"
						render={({ field: { value, onChange }, fieldState: { error } }) => (
							<>
								<div className="col-span-3 col-start-1 space-y-2">
									<label>کد تایید:</label>

									<div className="flex gap-3">
										<Input
											className="text-right"
											dir="ltr"
											disabled={value || !otpTime}
											value={otpCode}
											onChange={(e) => setOtpCode(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.keyCode === 13) {
													e.preventDefault();
													otpTimeBtn.current?.click();
												}
											}}
										/>
										{value || otpTime ? (
											<Button
												className="w-20 shrink-0"
												disabled={value}
												ref={otpTimeBtn}
												type="button"
												variant="secondary"
												onClick={async () => {
													try {
														await verifyContractOtp(otpCode);
														onChange(true);
														clearInterval(otpTimeInterval.current);
														clearErrors("PersonnelOtpVerificationStatus");
													} catch (err: any) {
														console.error(err);
														setError("PersonnelOtpVerificationStatus", {
															message:
																err?.message === "Invalid Code"
																	? "کد وارد شده اشتباه است."
																	: "خطای نامشخصی در هنگام تایید کد رخ داد.",
														});
													}
												}}
											>
												ثبت کد
											</Button>
										) : (
											<Button
												className="w-20 shrink-0"
												type="button"
												variant="secondary"
												onClick={async () => {
													try {
														const result = await sendContractOtp();
														setOtpTime(result.expireInSeconds);
														otpTimeInterval.current = setInterval(() => {
															setOtpTime((previous) => previous - 1);
														}, 1000);
													} catch (err) {
														console.error(err);
														toast.error(
															"خطای نامشخصی در هنگام ارسال کد رخ داد.",
														);
													}
												}}
											>
												ارسال کد
											</Button>
										)}
									</div>
									{value ? (
										<div className="text-xs text-green-800">
											کد تایید شما با موفقیت ثبت شد.
										</div>
									) : (
										otpTime > 0 && (
											<div className="text-xs text-muted-foreground">
												زمان باقی مانده تا ارسال مجدد کد:{" "}
												{`${Math.floor(otpTime / 60)
													.toString()
													.padStart(2, "0")}:${(
													otpTime -
													Math.floor(otpTime / 60) * 60
												)
													.toString()
													.padStart(2, "0")}`}
											</div>
										)
									)}
									<FieldError error={error} />
								</div>
							</>
						)}
						rules={{
							validate: (value) => {
								if (reviewStatus === ReviewStatus.Forward && !value) {
									return "تایید شماره همراه الزامی است.";
								}
							},
						}}
						// shouldUnregister
					/>
				</>
			)}

			{personnelStatusError && (
				<div className="col-span-full col-start-1">
					<DestructiveAlert>
						{informationStatusError && (
							<AlertDescription>
								{informationStatusError.message}
							</AlertDescription>
						)}

						{signatureStatusError && (
							<AlertDescription>
								{signatureStatusError.message}
							</AlertDescription>
						)}
					</DestructiveAlert>
				</div>
			)}
		</div>
	);
}

export { TaskPage };
