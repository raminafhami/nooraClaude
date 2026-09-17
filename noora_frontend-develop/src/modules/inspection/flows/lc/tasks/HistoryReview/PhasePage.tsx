"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { banks } from "@/data/banks";
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

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import {
	HistoryReviewStatus,
	historyReviewStatuses,
} from "../../models/HistoryReviewStatus";
import { ids } from "../../models/Ids";
import { GoodsDescriptionsList } from "../_components/GoodsDescriptionsList";
import { schema } from "./PhaseSchema";

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
		register(ids.assignees);
	}, [register]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("pre-submit", ({ task, data }) => {
				if (!task.data[ids.assignees][AssigneeType.Reviewer]) {
					const { id, fullname: name } = identity;
					data[ids.assignees][AssigneeType.Reviewer] = { id, name };
				}
			});

			hooks.registerHook(
				"submit",
				async ({ data, task }: { data: FormData; task: Task }) => {
					if (data[ids.historyReviewStatus] === HistoryReviewStatus.Return) {
						await setStageOfInstance(task.instanceId, "information-filling");
					}
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<Referrer
					assigneeKey={AssigneeType.Expert}
					noteId={ids.informationFormNote}
					title={assigneesTemplate[AssigneeType.Expert]}
				/>

				<Seperator className="mt-5" />

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

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شماره پیش فاکتور:</div>
					<Input defaultValue={task.data[ids.proformaNo]} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>تاریخ پیش فاکتور:</div>
					<Input defaultValue={task.data[ids.proformaDate]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نام بانک گشایش کننده اعتبار:</div>
					<div>
						<Input
							defaultValue={
								banks.find(
									(x) => x.value === task.data[ids.creditOpeningBankName],
								)?.label
							}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شعبه بانک گشایش کننده اعتبار:</div>
					<Input
						defaultValue={task.data[ids.creditOpeningBankBranch]}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

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
					<div>FOB فاکتور (ریال):</div>
					<PriceInput defaultValue={task.data[ids.invoiceFob]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>هزینه بازرسی (ریال):</label>
					<PriceInput
						defaultValue={task.data[ids.inspectionFeeInRial]}
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
								<Select items={historyReviewStatuses} {...field} />
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
								reviewStatus === HistoryReviewStatus.Return &&
								messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
