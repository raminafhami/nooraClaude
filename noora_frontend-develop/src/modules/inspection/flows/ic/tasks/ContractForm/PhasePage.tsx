"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Checkbox } from "@/form/Checkbox";
import { FieldError } from "@/form/FieldError";
import { PriceInput } from "@/form/PriceInput";
import { Radio } from "@/form/Radio";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { messages } from "@/messages";
import { routes } from "@/routes";

import { ids } from "../../models/Ids";
import { inspectionWagePayers } from "../../models/InspectionWagePayers";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task } = useTaskContext();

	const { formState, register, setValue, trigger, watch } =
		useFormContext<FormData>();
	const { errors } = formState;
	const fields = watch();

	useEffect(() => {
		register(ids.quantityOfGoodsPercentControl, {
			validate: (v, values) => {
				if (values[ids.quantityOfGoodsControlType] === "percent" && !v) {
					return messages.validation.required;
				}
			},
		});

		register(ids.qualityOfGoodsPercentControl, {
			validate: (v, values) => {
				if (values[ids.qualityOfGoodsControlType] === "percent" && !v) {
					return messages.validation.required;
				}
			},
		});

		register(ids.packingOfGoodsPercentControl, {
			validate: (v, values) => {
				if (values[ids.packingOfGoodsControlType] === "percent" && !v) {
					return messages.validation.required;
				}
			},
		});
	}, []);

	function getTemplateUrl(download: boolean): string {
		return new URL(
			`/files/${
				task.instanceId
			}/export/vars/CustomerName,CustomerData,ProformaNo,CustomTariffNo,InspectionWagePayer?template=contract.html&download=${
				download ? "1" : "0"
			}`,
			routes.externalApi,
		).toString();
	}

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-5">
				{/* template */}
				<div className="col-span-full">
					<div className="h-96 w-9/12 rounded-xl border-e-8 border-s-8 border-gray-200">
						{/* <iframe
              className="overflow-y-auto w-full h-[32rem] border border-gray-200 rounded-xl"
              src={getTemplateUrl(false)}
            ></iframe> */}
					</div>
				</div>
				<div className="col-span-full">
					<a
						className="rounded-lg border border-gray-200 px-4 py-1 leading-8"
						href={getTemplateUrl(true)}
						target="_blank"
					>
						دانلود پیش نویس قرارداد
					</a>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* quantity */}
				<div className="col-span-6">
					<label htmlFor={ids.inspectionWagePayer}>
						نحوه پرداخت کارمزد بازرسی:
					</label>
					<div className="mt-2">
						<Select
							id={ids.inspectionWagePayer}
							items={inspectionWagePayers}
							value={fields[ids.inspectionWagePayer]}
							onLeave={() => {
								trigger(ids.inspectionWagePayer);
							}}
							onMutate={(v) => {
								setValue(ids.inspectionWagePayer, v!, {
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								});
							}}
						/>
						<FieldError error={errors[ids.inspectionWagePayer]} />
					</div>
				</div>
				<div className="col-span-full">
					<div>کمیت:</div>
					<div className="mt-3">
						<Radio
							id={`${ids.quantityOfGoodsControlType}.random`}
							label="كنترل كميت كالا بصورت اتفاقي (RANDOM)"
							name={ids.quantityOfGoodsControlType}
							value="random"
						/>
						<Radio
							className="mt-2"
							id={`${ids.quantityOfGoodsControlType}.percent`}
							label={
								<>
									كنترل كميت كالا بصورت
									<PriceInput
										className="mx-3 h-8 w-14 text-center"
										id={ids.quantityOfGoodsPercentControl}
										value={fields[ids.quantityOfGoodsPercentControl]}
										onBlur={() => {
											trigger(ids.quantityOfGoodsPercentControl);
										}}
										onMutate={(v) => {
											setValue(ids.quantityOfGoodsPercentControl, v, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
									/>
									درصد
								</>
							}
							name={ids.quantityOfGoodsControlType}
							value="percent"
						/>
						<FieldError error={errors[ids.quantityOfGoodsControlType]} />
						<FieldError error={errors[ids.quantityOfGoodsPercentControl]} />
						<Checkbox
							className="mt-2"
							name={ids.quantityOfGoodsDocumentsControl}
							label="کنترل اسناد حمل"
						/>
					</div>
				</div>

				{/* quality */}
				<div className="col-span-full">
					<div>کیفیت:</div>
					<div className="mt-3">
						<Radio
							id={`${ids.qualityOfGoodsControlType}.random`}
							label="بازرسي ظاهري كالا بصورت اتفاقي (RANDOM)"
							name={ids.qualityOfGoodsControlType}
							value="random"
						/>
						<Radio
							className="mt-2"
							id={`${ids.qualityOfGoodsControlType}.percent`}
							label={
								<>
									بازرسي ظاهري كالا بصورت
									<PriceInput
										className="mx-3 h-8 w-14 text-center"
										id={ids.qualityOfGoodsPercentControl}
										value={fields[ids.qualityOfGoodsPercentControl]}
										onBlur={() => {
											trigger(ids.qualityOfGoodsPercentControl);
										}}
										onMutate={(v) => {
											setValue(ids.qualityOfGoodsPercentControl, v, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
									/>
									درصد
								</>
							}
							name={ids.qualityOfGoodsControlType}
							value="percent"
						/>
						<FieldError error={errors[ids.qualityOfGoodsControlType]} />
						<FieldError error={errors[ids.qualityOfGoodsPercentControl]} />
						<Checkbox
							className="mt-2"
							name={ids.qualityOfGoodsDocumentsControl}
							label="کنترل مدارک فروشنده در مورد کیفیت کالا"
						/>
					</div>
				</div>

				{/* packing */}
				<div className="col-span-full">
					<div>بسته بندی:</div>
					<div className="mt-3">
						<Radio
							id={`${ids.packingOfGoodsControlType}.random`}
							label="بازديد ظاهري بسته بندي كالا بصورت اتفاقي (RANDOM) از نظر سالم بودن و مطابقت آن با اسناد خرید"
							name={ids.packingOfGoodsControlType}
							value="random"
						/>
						<Radio
							className="mt-2"
							id={`${ids.packingOfGoodsControlType}.percent`}
							label={
								<>
									بازديد ظاهري بسته بندي كالا بصورت
									<PriceInput
										className="mx-3 h-8 w-14 text-center"
										id={ids.packingOfGoodsPercentControl}
										value={fields[ids.packingOfGoodsPercentControl]}
										onBlur={() => {
											trigger(ids.packingOfGoodsPercentControl);
										}}
										onMutate={(v) => {
											setValue(ids.packingOfGoodsPercentControl, v, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
									/>
									درصد از نظر سالم بودن و مطابقت آن با اسناد خرید
								</>
							}
							name={ids.packingOfGoodsControlType}
							value="percent"
						/>
						<FieldError error={errors[ids.packingOfGoodsControlType]} />
						<FieldError error={errors[ids.packingOfGoodsPercentControl]} />
						<Checkbox
							className="mt-2"
							name={ids.packingOfGoodsDocumentsControl}
							label="کنترل علائم حمل و هشدار دهنده کنترل اسناد حمل"
						/>
					</div>
				</div>

				{/* conditions */}
				<div className="col-span-full">
					<div>شرایط ویژه:</div>
					<div className="mt-3">
						<Checkbox
							className="mt-2"
							name={ids.monitoringOfLoadingProcess}
							label="نظارت بر بارگيري"
						/>
					</div>
				</div>

				{/* issue */}
				<div className="col-span-full">
					<div>گواهینامه:</div>
					<div className="mt-3">
						<Checkbox
							className="mt-2"
							name={ids.issueInspectionCertificate}
							label="صدور و ارائه گواهينامه بازرسي"
						/>
						<Checkbox
							className="mt-2"
							name={ids.issueInspectionReport}
							label="صدور گزارش بازرسي"
						/>
					</div>
				</div>

				{/* other */}
				<div className="col-span-full">
					<label htmlFor={ids.contractAttachmentDescription}>
						سایر شرایط مورد نظر:
					</label>
					<div className="mt-2">
						<Textarea
							id={ids.contractAttachmentDescription}
							{...register(ids.contractAttachmentDescription)}
						/>
					</div>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* contract customer description */}
				<div className="col-span-full">
					در صورتی که نیاز است توضیحاتی به قرارداد اضافه شود، توضیحات مد نظر خود
					را در بخش زیر وارد نمایید:
				</div>
				<div className="col-span-full">
					<Textarea
						id={ids.contractCustomerDescription}
						{...register(ids.contractCustomerDescription)}
					/>
				</div>
			</div>
		</>
	);
}
