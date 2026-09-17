import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import postSubContractor from "@/api/subContractors/postSubContractor";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { messages } from "@/messages";
import FileInput from "@/ui/FileInput";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface AddSubContractorProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	getData: () => void;
	temperatures?: { value: string; date: string }[];
}
interface FormData {
	name: string;
	verifyFile: File | undefined;
	reasonAssignment: string;
	evaluationDate: string;
	nextEvaluationDate: string;
}
export default function AddSubcontractorModal({
	isShow,
	setShow,
	getData,
}: AddSubContractorProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const form = useForm<FormData>({
		defaultValues: {
			name: "",
			reasonAssignment: "",
			evaluationDate: "",
			nextEvaluationDate: "",
		},
		mode: "onTouched",
	});
	const {
		formState,
		handleSubmit,
		register,
		setError,
		setValue,
		watch,
		trigger,
	} = form;
	const { errors, isSubmitting, isSubmitSuccessful, isDirty, isValid } =
		formState;
	const fields = watch();

	useEffect(() => {
		register("verifyFile", {
			required: messages.validation.required,
		});
	}, [fields, register]);

	console.log(fields);

	const onSubmit = async (data: FormData) => {
		try {
			setLoading(true);
			data.verifyFile &&
				(await postSubContractor({
					file: data.verifyFile,
					evaluationDate: data.evaluationDate,
					name: data.name,
					nextEvaluationDate: data.nextEvaluationDate,
					reasonAssignment: data.reasonAssignment,
				}));
			setShow(false);
			getData();
		} catch (error) {
			toast.error("خطا در ثبت اطلاعات، مجدد تلاش کنید!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{
				<MyModal
					size="2xl"
					title="افزودن پیمانکار"
					name="AddSubcontractor"
					onClose={() => setShow(false)}
					show={isShow}
					content={
						<>
							<form onSubmit={handleSubmit(onSubmit)}>
								<div className={`flex w-full flex-col justify-center gap-y-4`}>
									<div className="flex">
										<label className="basis-20 pt-2" htmlFor="name">
											نام:
										</label>
										<div className="grow">
											<Input
												id="name"
												{...register("name", {
													required: messages.validation.required,
												})}
											/>
											<FieldError error={errors["name"]} />
										</div>
									</div>

									<div className="flex">
										<label className="basis-20 pt-2" htmlFor="reasonAssignment">
											دلیل واگذاری:
										</label>
										<div className="grow">
											<Input
												id="reasonAssignment"
												{...register("reasonAssignment", {
													required: messages.validation.required,
												})}
											/>
											<FieldError error={errors["reasonAssignment"]} />
										</div>
									</div>

									<div className="flex">
										<label className="basis-20 pt-2" htmlFor="evaluationDate">
											تاریخ ارزیابی:
										</label>
										<div className="grow">
											<DateInput
												id={"evaluationDate"}
												autoComplete={"off"}
												onLeave={() => {
													trigger("evaluationDate");
												}}
												onMutate={(v) => {
													setValue("evaluationDate", getDatesIngregorian(v), {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													});
												}}
												{...(({ ref, ...register }) => register)(
													register("evaluationDate", {
														deps: [],
														required: messages.validation.required,
													}),
												)}
											/>
											<FieldError error={errors["evaluationDate"]} />
										</div>
									</div>
									<div className="flex">
										<label
											className="basis-20 pt-2"
											htmlFor="nextEvaluationDate"
										>
											تاریخ ارزیابی بعدی:
										</label>
										<div className="grow">
											<DateInput
												id={"nextEvaluationDate"}
												autoComplete={"off"}
												onLeave={() => {
													trigger("nextEvaluationDate");
												}}
												onMutate={(v) => {
													setValue(
														"nextEvaluationDate",
														getDatesIngregorian(v),
														{
															shouldDirty: true,
															shouldTouch: true,
															shouldValidate: true,
														},
													);
												}}
												{...(({ ref, ...register }) => register)(
													register("nextEvaluationDate", {
														deps: [],
														required: messages.validation.required,
													}),
												)}
											/>
											<FieldError error={errors["nextEvaluationDate"]} />
										</div>
									</div>

									<div className="flex">
										<label className="basis-20 pt-2" htmlFor="file">
											مدرک تایید صلاحیت:
										</label>
										<div className="grow self-center">
											<FileInput
												loading={loading}
												setFile={(v) => {
													setValue("verifyFile", v as File, {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													});
												}}
												onRemove={async () => {
													setValue("verifyFile", undefined, {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													});
												}}
												file={fields.verifyFile}
											/>
											<FieldError error={errors["verifyFile"]} />
										</div>
									</div>
									<button
										className="btn w-26 float-left cursor-pointer self-end rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
										disabled={!isDirty || isSubmitting || !isValid}
									>
										{isSubmitting ? (
											<Loading
												horizontalPlacement="center"
												intent="white"
												size="sm"
											>
												درحال ارسال...
											</Loading>
										) : (
											"افزودن"
										)}
									</button>
								</div>
							</form>
						</>
					}
				/>
			}
		</>
	);
}
export function getDatesIngregorian(date: string): string {
	return moment(
		moment(date, "jYYYY/jMM/jDD").locale("en").format("YYYY-MM-DD"),
	).toISOString();
}
