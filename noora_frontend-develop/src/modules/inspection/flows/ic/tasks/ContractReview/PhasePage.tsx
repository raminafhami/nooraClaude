"use client";

import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Checkbox } from "@/form/Checkbox";
import { Input } from "@/form/Input";
import { Radio } from "@/form/Radio";
import { Textarea } from "@/form/textarea";

import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks } = useTaskContext();
	const { data } = task;

	const { formState, register, setValue, trigger, watch } =
		useFormContext<FormData>();
	const { errors } = formState;
	const fields = watch();

	hooks.registerHook("submit", async ({ task }) => {
		await setStageOfInstance(task.instanceId, "inspection");
	});

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{/* quantity */}
			<div className="col-span-full">
				<div>کمیت:</div>
				<div className="mt-3">
					<Radio
						disabled={true}
						id={`${ids.quantityOfGoodsControlType}.random`}
						label="كنترل كميت كالا بصورت اتفاقي (RANDOM)"
						name={ids.quantityOfGoodsControlType}
						value="random"
						checked={data[ids.quantityOfGoodsControlType] === "random"}
					/>
					<Radio
						disabled={true}
						className="mt-2"
						id={`${ids.quantityOfGoodsControlType}.percent`}
						label={
							<>
								كنترل كميت كالا بصورت
								<Input
									className="mx-2 w-16 text-center"
									defaultValue={data[ids.quantityOfGoodsPercentControl]}
									disabled
									template="sm"
								/>
								درصد
							</>
						}
						name={ids.quantityOfGoodsControlType}
						value="percent"
						checked={data[ids.quantityOfGoodsControlType] === "percent"}
					/>
					<Checkbox
						defaultChecked={data[ids.quantityOfGoodsDocumentsControl]}
						disabled={true}
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
						checked={data[ids.qualityOfGoodsControlType] === "random"}
						disabled={true}
						id={`${ids.qualityOfGoodsControlType}.random`}
						label="بازرسي ظاهري كالا بصورت اتفاقي (RANDOM)"
						name={ids.qualityOfGoodsControlType}
						value="random"
					/>
					<Radio
						checked={data[ids.qualityOfGoodsControlType] === "percent"}
						disabled={true}
						className="mt-2"
						id={`${ids.qualityOfGoodsControlType}.percent`}
						label={
							<>
								بازرسي ظاهري كالا بصورت
								<Input
									className="mx-2 w-16 text-center"
									defaultValue={data[ids.qualityOfGoodsPercentControl]}
									disabled
									template="sm"
								/>
								درصد
							</>
						}
						name={ids.qualityOfGoodsControlType}
						value="percent"
					/>
					<Checkbox
						defaultChecked={data[ids.qualityOfGoodsDocumentsControl]}
						disabled={true}
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
						checked={data[ids.packingOfGoodsControlType] === "random"}
						disabled={true}
						id={`${ids.packingOfGoodsControlType}.random`}
						label="بازديد ظاهري بسته بندي كالا بصورت اتفاقي (RANDOM) از نظر سالم بودن و مطابقت آن با اسناد خرید"
						name={ids.packingOfGoodsControlType}
						value="random"
					/>
					<Radio
						checked={data[ids.packingOfGoodsControlType] === "percent"}
						disabled={true}
						className="mt-2"
						id={`${ids.packingOfGoodsControlType}.percent`}
						label={
							<>
								بازديد ظاهري بسته بندي كالا بصورت
								<Input
									className="mx-2 w-16 text-center"
									defaultValue={data[ids.packingOfGoodsPercentControl]}
									disabled
									template="sm"
								/>
								درصد از نظر سالم بودن و مطابقت آن با اسناد خرید
							</>
						}
						name={ids.packingOfGoodsControlType}
						value="percent"
					/>
					<Checkbox
						defaultChecked={data[ids.packingOfGoodsDocumentsControl]}
						disabled={true}
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
						defaultChecked={data[ids.monitoringOfLoadingProcess]}
						disabled={true}
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
						defaultChecked={data[ids.issueInspectionCertificate]}
						disabled={true}
						className="mt-2"
						name={ids.issueInspectionCertificate}
						label="صدور و ارائه گواهينامه بازرسي"
					/>
					<Checkbox
						defaultChecked={data[ids.issueInspectionReport]}
						disabled={true}
						className="mt-2"
						name={ids.issueInspectionReport}
						label="صدور گزارش بازرسي"
					/>
				</div>
			</div>

			{/* other */}
			<div className="col-span-full">
				<label>سایر شرایط مورد نظر:</label>
				<div className="mt-2">
					<Textarea
						defaultValue={data[ids.contractAttachmentDescription]}
						disabled={true}
					/>
				</div>
			</div>

			{/* seperator */}
			<div className="col-span-full mt-5">
				<div className="h-1 bg-gray-100"></div>
			</div>

			{/* customer contract description */}
			<div className="col-span-full">
				توضیحات مد نظر مشتری جهت قرارگیری در قرارداد:
			</div>
			<div className="col-span-full">
				<Textarea
					defaultValue={data[ids.contractCustomerDescription]}
					disabled={true}
				/>
			</div>

			{/* final contract description */}
			<div className="col-span-full">
				در صورتی که نیاز است توضیحات نهایی ای به قرارداد اضافه شود، توضیحات مد
				نظر خود را در بخش زیر وارد نمایید:
			</div>
			<div className="col-span-full">
				<Textarea
					id={ids.contractDescription}
					{...register(ids.contractDescription)}
				/>
			</div>
		</div>
	);
}
