"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { banks } from "@/data/banks";
import { customs } from "@/data/customs";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { messages } from "@/messages";
import { PriceInput } from "@/ui/MaskInput/PriceInput";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { GoodsCustomTariffNosList } from "../../components/GoodsCustomTariffNos/GoodsCustomTariffNosList";
import { GoodsDescriptionsList } from "../../components/GoodsDescriptions/GoodsDescriptionsList";
import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
  InspectionMethod,
  inspectionMethod,
} from "../../models/InspectionMethod";
import { schema } from "./PhaseSchema";
import { reviewStatusOptions } from "./ReviewStatus";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const {
		control,
		formState: { errors },
		register,
		watch,
	} = useFormContext<FormData>();
	const fields = watch();
	const { [ids.historyReviewStatus]: reviewStatus } = fields;

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					if (!task.data[ids.assignees][AssigneeType.Reviewer]) {
						const { id, fullname: name } = identity;

						data[ids.assignees][AssigneeType.Reviewer] = { id, name };
					}
				},
			);

			hooks.registerHook("submit", async ({ task, data }) => {
				if (data[ids.historyReviewStatus] === "return") {
					await setStageOfInstance(task.instanceId, "information-filling");
				}
			});
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<Referrer
					assigneeKey={AssigneeType.Expert}
					noteId={ids.informationFormByExpertNote}
					title={assigneesTemplate[AssigneeType.Expert]}
				/>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.buyerNameEn}>روش بازرسی:</label>
					<Input
						defaultValue={
							inspectionMethod[
								task.data[ids.inspectionMethod] as InspectionMethod
							]
						}
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نوع درخواست:</div>
					<Input
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label>مشتری:</label>
					<Input
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>خریدار:</label>
					<Input defaultValue={task.data[ids.buyer].name} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label>نام انگلیسی خریدار:</label>
					<Input defaultValue={task.data[ids.buyerNameEn]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شماره پروفرما:</div>
					<Input defaultValue={task.data[ids.proformaNo]} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>تاریخ پروفرما:</div>
					<Input defaultValue={task.data[ids.proformaDate]} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شماره ثبت سفارش:</div>
					<Input defaultValue={task.data[ids.registrationOrderNo]} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>تاریخ ثبت سفارش:</div>
					<Input defaultValue={task.data[ids.registrationOrderDate]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نام بانک:</div>
					<div>
						<Input
							defaultValue={
								banks.find((x) => x.value === task.data[ids.bankName])?.label ||
								"-"
							}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شعبه بانک:</div>
					<Input defaultValue={task.data[ids.bankBranch] || "-"} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>گمرک:</div>
					<Input
						defaultValue={
							customs.find((x) => x.value === task.data[ids.customName])?.label
						}
						disabled
					/>
				</div>

				<GoodsCustomTariffNosList />

				<GoodsDescriptionsList />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نوع کالاها:</div>
					<Input
						defaultValue={
							getGoodsInspectionFieldById(task.data[ids.goodsField])?.title ??
							"-"
						}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>FOB فاکتور (یورو):</div>
					<PriceInput defaultValue={task.data[ids.invoiceFob]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>هزینه بازرسی (ریال):</label>
					<PriceInput
						defaultValue={task.data[ids.inspectionFeeAmountInRial]}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نام ترخیص کار:</div>
					<Input defaultValue={task.data[ids.dischargerName] || "-"} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شماره تماس ترخیص کار:</div>
					<Input
						defaultValue={task.data[ids.dischargerPhoneNo] || "-"}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.historyReviewStatus}>نتیجه بررسی:</label>
					<Controller
						control={control}
						name={ids.historyReviewStatus}
						render={({ field, fieldState }) => (
							<>
								<Select items={reviewStatusOptions} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							deps: [ids.historyReviewNote],
							required: messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full space-y-2">
					<label htmlFor={ids.historyReviewNote}>توضیحات بررسی:</label>
					<Controller
						control={control}
						name={ids.historyReviewNote}
						render={({ field, fieldState }) => (
							<>
								<Textarea {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								reviewStatus === "return" && messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
