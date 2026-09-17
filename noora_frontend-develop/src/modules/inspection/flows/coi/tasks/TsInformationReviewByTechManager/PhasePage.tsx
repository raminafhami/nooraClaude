"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { customs } from "@/data/customs";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { reviewStatusOptions } from "@/inspection/models/ReviewStatus";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { control, watch } = useFormContext<FormData>();
	const fields = watch();

	const { [ids.tsInformationReviewByTechManagerStatus]: reviewStatus } = fields;

	const isReviewStatusNegative = useMemo(() => {
		return reviewStatus === "return";
	}, [reviewStatus]);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				({ task, data }: { task: Task; data: FormData }) => {},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// if (data[ids.informationReviewStatus] === "approve") {
					//   await Promise.allSettled([
					//     InstanceService.setStage(task.instanceId, "certificate-issuance"),
					//     InstanceService.addWatcher(
					//       task.instanceId,
					//       data[ids.assignees][AssigneeType.Admin]?.id
					//     ),
					//   ]);
					// } else {
					//   await InstanceService.setStage(
					//     task.instanceId,
					//     "information-filling"
					//   );
					// }
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
				<Referrer
					assigneeKey={AssigneeType.TechnicalExpert}
					noteId={ids.tsInformationReviewByTechExpertNote}
				/>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نوع درخواست:</label>
					<Input
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>مشتری:</label>
					<Input
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>خریدار:</label>
					<Input defaultValue={task.data[ids.buyer].name} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>گمرک:</label>
					<Input
						defaultValue={
							customs.find((x) => x.value === task.data[ids.customName])?.label
						}
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
					<label>شرح کالاها:</label>
					<Input defaultValue={task.data[ids.goodsDescriptions]} disabled />
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نوع کالاها:</label>
					<Input
						defaultValue={
							getGoodsInspectionFieldById(task.data[ids.goodsField])?.title
						}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نام ترخیص کار:</label>
					<Input defaultValue={task.data[ids.dischargerName]} disabled />
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>شماره تماس ترخیص کار:</label>
					<div>
						<Input defaultValue={task.data[ids.dischargerPhoneNo]} disabled />
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>کشور مبدأ:</label>
					<Input defaultValue={task.data[ids.countryOfOrigin]} disabled />
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>محل بازرسی:</label>
					<Input defaultValue={task.data[ids.inspectionPlace]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.tsInformationReviewByTechManagerStatus}>
						نتیجه:
					</label>
					<Controller
						control={control}
						name={ids.tsInformationReviewByTechManagerStatus}
						render={({ field, fieldState }) => (
							<>
								<Select items={reviewStatusOptions} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							deps: [ids.tsInformationReviewByTechManagerNote],
							required: messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full space-y-2">
					<label htmlFor={ids.tsInformationReviewByTechManagerNote}>
						توضیحات:
					</label>
					<Controller
						control={control}
						name={ids.tsInformationReviewByTechManagerNote}
						render={({ field, fieldState }) => (
							<>
								<Textarea {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isReviewStatusNegative && messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
