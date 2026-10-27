import moment from "moment-jalaali";
import { useContext, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FaCircleCheck } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { createExpertiseCertificate } from "@/hrm/personnelExpertise/services/createExpertiseCertificate";
import { deleteExpertiseCertificate } from "@/hrm/personnelExpertise/services/deleteExpertiseCertificate";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";

import { JobsContext } from "./JobsContext";

export interface FormData {
	certificateName: string;
	organizationName: string;
	certificateDate: string;
	file: File | undefined;
}

function SentTick({ show }: { show: boolean }) {
	return show ? (
		<FaCircleCheck
			className="mt-3 h-4 w-4 shrink-0 text-green-500"
			title="ثبت شد"
		/>
	) : null;
}

export function CertificateForm({
	expertiseId,
	title,
}: {
	expertiseId: string;
	title: string;
}) {
	const { expertisesStatus, setExpertisesStatus } = useContext(JobsContext);
	const entry = expertisesStatus.find((e) => e.expertiseId === expertiseId);
	const sent = !!entry?.sent;
	const [sending, setSending] = useState(false);
	const [removing, setRemoving] = useState(false);
	// Remounts the fields: the date picker and the file input keep their own
	// state, so a form reset alone does not empty them.
	const [fieldsKey, setFieldsKey] = useState(0);
	const methods = useForm<FormData>({
		mode: "onTouched",
	});

	const { clearErrors, formState, register, reset, setValue, trigger, watch } =
		methods;
	const { errors } = formState;
	const inputRef: any = useRef(null);
	const [organizationName, certificateDate, file] = watch([
		"organizationName",
		"certificateDate",
		"file",
	]);

	// Until it is sent on its own, the certificate stays pending in the
	// modal state, so the final "ثبت" still uploads it (and stays disabled
	// while it is half filled).
	useEffect(() => {
		if (sent) return;
		setExpertisesStatus((previous) =>
			previous.map((expertise) =>
				expertise.expertiseId === expertiseId
					? {
							...expertise,
							organizationName: organizationName ?? "",
							file,
							certificateDate: getDatesIngregorian(certificateDate ?? ""),
						}
					: expertise,
			),
		);
	}, [organizationName, certificateDate, file, sent, expertiseId, setExpertisesStatus]);

	const handleClick = () => {
		if (!sent) inputRef.current.click();
	};

	async function handleSend() {
		if (!(await trigger())) return;
		if (!entry) return;

		setSending(true);
		try {
			const saved = await createExpertiseCertificate({
				expertiseId,
				userId: entry.userId,
				status: "qualified",
				organizationName,
				certificateDate: getDatesIngregorian(certificateDate),
				file,
			});
			// Saved: keep it qualified and drop the pending fields so the final
			// "ثبت" neither re-uploads it nor waits on it.
			setExpertisesStatus((previous) =>
				previous.map((expertise) =>
					expertise.expertiseId === expertiseId
						? {
								expertiseId,
								userId: expertise.userId,
								status: "qualified",
								title: expertise.title,
								sent: true,
								sentRowId: saved.id,
							}
						: expertise,
				),
			);
			clearErrors();
			toast.success(`گواهی «${title}» با موفقیت افزوده شد.`);
		} catch (err) {
			console.error(err);
			toast.error(`ارسال گواهی «${title}» ناموفق بود. دوباره تلاش کنید.`);
		} finally {
			setSending(false);
		}
	}

	function clearFields() {
		reset({ organizationName: "", certificateDate: "", file: undefined });
		clearErrors();
		setFieldsKey((k) => k + 1);
	}

	// Before sending: just empties the fields. After sending: deletes the
	// uploaded certificate so the right one can be sent instead.
	async function handleRemove() {
		if (!sent) {
			clearFields();
			return;
		}
		if (!entry?.sentRowId) return;
		if (!window.confirm(`گواهی ارسال‌شده‌ی «${title}» حذف شود؟`)) return;

		setRemoving(true);
		try {
			await deleteExpertiseCertificate(entry.sentRowId);
			// back to "دارد" with empty fields, like before sending
			setExpertisesStatus((previous) =>
				previous.map((expertise) =>
					expertise.expertiseId === expertiseId
						? {
								expertiseId,
								userId: expertise.userId,
								status: "qualified",
								title: expertise.title,
								organizationName: "",
								file: undefined,
								certificateDate: "",
							}
						: expertise,
				),
			);
			clearFields();
			toast.success(`گواهی «${title}» حذف شد.`);
		} catch (err) {
			console.error(err);
			toast.error(`حذف گواهی «${title}» ناموفق بود. دوباره تلاش کنید.`);
		} finally {
			setRemoving(false);
		}
	}

	return (
		<FormProvider {...methods}>
			<form onSubmit={(e) => e.preventDefault()}>
				{/* Sent fields are locked with readOnly + pointer-events, not
				    `disabled`: react-hook-form treats disabled fields as empty and
				    would show "required" under filled fields. The buttons stay
				    clickable. */}
				<div
					className="flex w-full flex-col items-start gap-5 p-2 md:flex-row"
					key={fieldsKey}
				>
					<div
						className={`flex w-full gap-2 ${sent ? "pointer-events-none" : ""}`}
					>
						<div className="w-full">
							<Input
								autoComplete="new-password"
								placeholder="نام سازمان گواهی دهنده"
								className={`rounded-md text-right ${sent ? "bg-gray-50" : ""}`}
								dir="ltr"
								id="organizationName"
								readOnly={sent}
								{...register("organizationName", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={errors["organizationName"]} />
						</div>
						<SentTick show={sent} />
					</div>
					<div
						className={`flex w-full gap-2 ${sent ? "pointer-events-none" : ""}`}
					>
						<div className="w-full">
							<DateInput
								placeholder="تاریخ دریافت گواهی"
								readOnly={sent}
								onLeave={() => {
									trigger("certificateDate");
								}}
								onMutate={(v) => {
									setValue("certificateDate", v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(
									register("certificateDate", {
										deps: [],
										required: messages.validation.required,
									}),
								)}
							/>
							<FieldError error={errors["certificateDate"]} />
						</div>
						<SentTick show={sent} />
					</div>
					<div
						className={`flex w-full gap-2 ${sent ? "pointer-events-none" : ""}`}
					>
						<div className="w-full">
							<input
								readOnly
								onClick={handleClick}
								onKeyDown={() => null}
								value={file ? file.name : undefined}
								className={`focus:placeholder-gray group relative h-10 w-full cursor-pointer text-ellipsis rounded-md border border-gray-200 px-2 py-2 focus:border-blue-500 focus:text-black focus:outline-0 ${
									sent ? "bg-gray-50" : ""
								}`}
								placeholder={"پیوست"}
							/>
							<Input
								style={{ display: "none" }}
								type="file"
								ref={inputRef}
								{...(({ ref, ...register }) => register)(
									register("file", {
										required: messages.validation.required,
									}),
								)}
								onChange={(event) =>
									setValue("file", event.target.files?.[0], {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									})
								}
							/>
							<FieldError error={errors["file"]} />
						</div>
						<SentTick show={sent} />
					</div>
					<div className="flex shrink-0 items-center gap-2">
						{sent ? (
							<span className="flex h-10 items-center gap-1 whitespace-nowrap text-sm text-green-600">
								<FaCircleCheck />
								ارسال شد
							</span>
						) : (
							<Button
								type="button"
								variant="primary"
								className="h-10 min-w-20"
								disabled={sending || removing}
								onClick={handleSend}
							>
								{sending ? <Loading intent="white" size="xs" /> : "ارسال"}
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							className="h-10 min-w-16 text-red-600 hover:text-red-700"
							disabled={sending || removing}
							title={sent ? "حذف گواهی ارسال‌شده" : "پاک کردن فیلدها"}
							onClick={handleRemove}
						>
							{removing ? <Loading size="xs" /> : "حذف"}
						</Button>
					</div>
				</div>
			</form>
		</FormProvider>
	);
}

// "" for an empty/partial date, so a half-typed date never counts as filled.
export function getDatesIngregorian(date: string): string {
	const m = moment(date, "jYYYY/jMM/jDD", true);
	return m.isValid() ? m.locale("en").format("YYYY-MM-DD") : "";
}
