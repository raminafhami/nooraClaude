import moment from "moment-jalaali";
import { useContext, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { messages } from "@/messages";

import { JobsContext } from "./JobsContext";

export interface FormData {
	certificateName: string;
	organizationName: string;
	certificateDate: string;
	file: File | undefined;
}

export function CertificateForm({ expertiseId }: { expertiseId: string }) {
	const { expertisesStatus, setExpertisesStatus } = useContext(JobsContext);
	const methods = useForm<FormData>({
		mode: "onTouched",
	});

	const { formState, register, setError, setValue, trigger } = methods;
	const { errors } = formState;
	const inputRef: any = useRef(null);

	const handleClick = () => {
		inputRef.current.click();
	};
	if (methods.formState.isValid) {
		try {
			setExpertisesStatus(() => {
				const updatedStatus = expertisesStatus.map((expertise) => {
					if (expertise.expertiseId === expertiseId) {
						return {
							...expertise,
							organizationName: methods.getValues("organizationName"),
							file: methods.getValues("file"),
							certificateDate: getDatesIngregorian(
								methods.getValues("certificateDate"),
							),
						};
					}
					return expertise;
				});
				return updatedStatus;
			});
		} catch (err) {
			setError("root.server", {
				message: "Something went wrong...",
			});
		}
	}
	return (
		<FormProvider {...methods}>
			<form>
				<div className="flex w-full flex-col items-start gap-5 p-2 md:flex-row">
					<div className="w-full">
						<Input
							autoComplete="new-password"
							placeholder="نام سازمان گواهی دهنده"
							className="rounded-md text-right"
							dir="ltr"
							id="organizationName"
							{...register("organizationName", {
								required: messages.validation.required,
							})}
						/>
						<FieldError error={errors["organizationName"]} />
					</div>
					<div className="w-full">
						<DateInput
							placeholder="تاریخ دریافت گواهی"
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
					<div className="w-full">
						<input
							readOnly
							onClick={handleClick}
							onKeyDown={() => null}
							value={
								methods.watch("file") ? methods.watch("file")?.name : undefined
							}
							className={`focus:placeholder-gray group relative h-10 w-full cursor-pointer text-ellipsis rounded-md border border-gray-200 px-2 py-2 focus:border-blue-500 focus:text-black focus:outline-0`}
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
				</div>
			</form>
		</FormProvider>
	);
}

export function getDatesIngregorian(date: string): string {
	return moment(date, "jYYYY/jMM/jDD").locale("en").format("YYYY-MM-DD");
}
