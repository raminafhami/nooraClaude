"use client";

import moment from "jalali-moment";
import { useCallback, useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaInfoCircle } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { BuyerType } from "@/buyers/enums/BuyerType";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { messages } from "@/messages";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { GoodsDescriptionsList } from "../_components/GoodsDescriptions/GoodsDescriptionsList";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const {
		control,
		formState: { errors },
		register,
		setValue,
		watch,
	} = useFormContext<FormData>();

	const fields = watch();

	const { [ids.inspectionDate]: inspectionDate } = fields;

	const {
		[ids.buyer]: buyer,
		[ids.caseOperationDescription]: caseOperationDescription,
		[ids.caseOperationSummary]: caseOperationSummary,
		[ids.contractIssueDate]: contractIssueDate,
		[ids.contractIssueNo]: contractIssueNo,
		[ids.cottageNo]: cottageNo,
		[ids.goodsDescriptions]: goodsDescriptions,
		[ids.goodsQuantity]: goodsQuantity,
		[ids.goodsQuantityUnit]: goodsQuantityUnit,
		[ids.inspectionPlace]: inspectionPlace,
	} = task.data;

	const fillReportSubject = useCallback(() => {
		setValue(
			ids.reportSubject,
			`گزارش بازرسی عملیات ${caseOperationSummary} متعلق به ${
				buyer.type === BuyerType.Legal ? "شرکت" : "آقا/خانم"
			} ${buyer.name} موضوع اظهارنامه به شماره کوتاژ ${cottageNo}`,
			{
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			},
		);
	}, [buyer.name, buyer.type, caseOperationSummary, cottageNo, setValue]);

	const fillReportDescription = useCallback(() => {
		setValue(
			ids.reportDescription,
			`پیرو قرارداد منعقده فی ما بین به شماره ${contractIssueNo} مورخ ${contractIssueDate} به استحضار می رساند ${caseOperationDescription} در تاریخ ${
				inspectionDate || "{تاریخ بازرسی}"
			} در محل ${inspectionPlace} بر روی ${goodsQuantity} ${goodsQuantityUnit} و کالای مربوطه آن انجام پذیرفت.`,
			{
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			},
		);
	}, [
		caseOperationDescription,
		contractIssueDate,
		contractIssueNo,
		goodsQuantity,
		goodsQuantityUnit,
		inspectionDate,
		inspectionPlace,
		setValue,
	]);

	useEffect(() => {
		register(ids.assignees);
		register(ids.reportIssueDate);
		register(ids.reportIssueNo);
	}, [register]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("pre-submit", async ({ data, task }) => {
				data[ids.reportIssueDate] = moment().format("jYYYY/jMM/jDD");
				data[ids.reportIssueNo] = `${task.caseNo}`;
			});

			hooks.registerHook("submit", async ({ task }) => {
				await setStageOfInstance(task.instanceId, "report-issued");
			});
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<div className="col-span-3 col-start-1">
					<div>ارجاع دهنده:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.assignees][AssigneeType.Manager].name}
						disabled
					/>
				</div>

				{task.data[ids.informationReviewNote] && (
					<div className="col-span-full">
						<Alert variant="info">
							<FaInfoCircle />
							<AlertDescription>
								<div className="font-bold">
									توضیحات مدیر:{" "}
									{task.data[ids.assignees][AssigneeType.Manager].name}
								</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.informationReviewNote]}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				)}

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>نوع درخواست:</div>
					<Input
						className="mt-2"
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1">
					<label>مشتری:</label>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<label>خریدار:</label>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.buyer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>شماره قرارداد:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.contractIssueNo]}
						disabled
					/>
				</div>

				<div className="col-span-3">
					<div>تاریخ قرارداد:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.contractIssueDate]}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>سازمان مرجع مسئول:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.authorityOrganization]}
						disabled
					/>
				</div>

				<div className="col-span-3">
					<div>شخص مرجع مسئول:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.authorityPerson] || "-"}
						disabled
					/>
				</div>

				<div className="col-span-full col-start-1">
					<div>شرح عملیات نظارتی:</div>
					<div>
						<Textarea
							className="mt-2 min-h-fit"
							defaultValue={task.data[ids.caseOperationDescription]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<div>خلاصه عملیات نظارتی:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.caseOperationSummary]}
							disabled
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>شماره کوتاژ:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.cottageNo]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.inspectionDate}>تاریخ بازرسی:</label>
					<div className="mt-2">
						<Controller
							control={control}
							name={ids.inspectionDate}
							render={({
								field: { name, value, onBlur, onChange },
								fieldState: { error },
							}) => (
								<>
									<DateInput
										id={name}
										value={value}
										onLeave={onBlur}
										onMutate={onChange}
									/>
									<FieldError error={error} />
								</>
							)}
							rules={{ required: messages.validation.required }}
						/>
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<div>مکان بازرسی:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.inspectionPlace]}
							disabled
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>تعداد کالاها:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.goodsQuantity]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3">
					<div>واحد شمارش کالاها:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.goodsQuantityUnit]}
							disabled
						/>
					</div>
				</div>

				<GoodsDescriptionsList />

				<Seperator className="mt-5" />

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.reportSubject}>موضوع گزارش:</label>
					<div>
						<Input
							id={ids.reportSubject}
							{...register(ids.reportSubject, {
								required: messages.validation.required,
							})}
						/>
						<FieldError error={errors[ids.reportSubject]} />
					</div>
					<Button size="sm" type="button" onClick={() => fillReportSubject()}>
						<FaPencil />
						<span>پر کردن</span>
					</Button>
				</div>

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.reportDescription}>شرح گزارش:</label>
					<div>
						<Controller
							control={control}
							name={ids.reportDescription}
							render={({ field, fieldState: { error } }) => (
								<>
									<Textarea id={field.name} {...field} />
									<FieldError error={error} />
								</>
							)}
						/>
					</div>
					<Button
						size="sm"
						type="button"
						onClick={() => fillReportDescription()}
					>
						<FaPencil />
						<span>پر کردن</span>
					</Button>
				</div>
			</div>
		</>
	);
}
