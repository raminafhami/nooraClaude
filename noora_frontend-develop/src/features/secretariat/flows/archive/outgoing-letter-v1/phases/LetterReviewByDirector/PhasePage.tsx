"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Controller, useFormContext } from "react-hook-form";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { messages } from "@/messages";

import { Template } from "../../components/template";
import { confidentialityOptions, ids, priorityOptions } from "../../data";
import { reviewStatuses } from "./PhaseData";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const {
		formState: { errors },
		register,
		setValue,
		trigger,
		watch,
	} = useFormContext<FormData>();

	const fields = watch();

	const [trInputVal, setTrInputVal] = useState<string>("");

	useEffect(() => {
		register(ids.letterSignature);
		register(ids.letterReviewByDirectorStatus, {
			required: { value: true, message: messages.validation.required },
		});
	});

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			({ task, data }: { task: Task; data: FormData }) => {
				if (data[ids.letterReviewByDirectorStatus] === "confirm") {
					const { id, fullname: name } = identity!;
					data[ids.assignees].Approver = { id, name };

					data[ids.letterSignature] = `Signed by Director ${
						task.data[ids.assignees]["Director"]!.name
					}`;
				}
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{/* referrer */}
				{task.data[ids.letterReviewByManagerNote] && (
					<div className="col-span-full">
						<Alert variant="info">
							<AlertDescription>
								<div className="font-bold">
									{task.data[ids.assignees]["Manager"]!.name}:
								</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.letterReviewByManagerNote]}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				)}

				{/* seperator */}
				{task.data[ids.letterReviewByManagerNote] && (
					<div className="col-span-full">
						<div className="h-1 bg-gray-100"></div>
					</div>
				)}

				{/* letter */}
				<div className="col-span-3 col-start-1">
					<label>ایجاد کننده نامه:</label>
					<div className="mt-2">
						<Input
							defaultValue={task.data[ids.assignees]["Author"].name}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label>ارسال توسط:</label>
					<div className="mt-2">
						<Input
							defaultValue={task.data[ids.assignees]["Manager"].name}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterPriority}>اولویت نامه:</label>
					<div className="mt-2">
						<Input
							defaultValue={
								priorityOptions.find(
									(x) => x.value === task.data[ids.letterPriority],
								)!.label
							}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterConfidentiality}>محرمانگی نامه:</label>
					<div className="mt-2">
						<Select
							id={ids.letterConfidentiality}
							items={confidentialityOptions}
							value={fields[ids.letterConfidentiality]}
							onLeave={() => {
								trigger(ids.letterConfidentiality);
							}}
							onMutate={(v) => {
								setValue(ids.letterConfidentiality, v!, {
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								});
							}}
						/>
						<FieldError error={errors[ids.letterConfidentiality]} />
					</div>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* letter */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterToName}>به:</label>
					<div className="mt-2">
						<Input
							id={ids.letterToName}
							{...register(ids.letterToName, {
								required: {
									value: true,
									message: messages.validation.required,
								},
							})}
						/>
						<FieldError error={errors[ids.letterToName]} />
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterToPosition}>سمت:</label>
					<div className="mt-2">
						<Input
							id={ids.letterToPosition}
							{...register(ids.letterToPosition)}
						/>
						<FieldError error={errors[ids.letterToPosition]} />
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterSubject}>موضوع:</label>
					<div className="mt-2">
						<Input id={ids.letterSubject} {...register(ids.letterSubject)} />
						<FieldError error={errors[ids.letterSubject]} />
					</div>
				</div>

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterDate}>تاریخ:</label>
					<Controller
						name={ids.letterDate}
						render={({ field: { value, onChange } }) => (
							<DatePicker
								calendar={persian}
								locale={persian_fa}
								inputClass={`min-w-[230px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
								placeholder="تاریخ"
								calendarPosition="bottom"
								onFocusedDateChange={(dateFocused, dateClicked) =>
									dateClicked && onChange(dateClicked?.toDate())
								}
								render={(value, openCalendar, onValueChange) => (
									<div className="group mt-2 flex max-w-[400px] rounded-2xl border border-gray-200 bg-white">
										<div
											className="flex shrink-0 basis-10 cursor-pointer items-center justify-center rounded-s-2xl border-e border-gray-200 group-aria-disabled:cursor-not-allowed group-aria-disabled:bg-gray-50"
											onClick={openCalendar}
										>
											<FaCalendarAlt />
										</div>
										<input
											className="h-10 w-full rounded-e-2xl border-none px-3 text-start leading-4 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
											value={value}
											onChange={onValueChange}
											onFocus={openCalendar}
										/>
									</div>
								)}
								value={value}
							/>
						)}
					/>
				</div>

				<div className="col-span-5 col-start-1">
					<label htmlFor="transcription">رونوشت:</label>
					<div className="mt-2">
						<Input
							id="transcription"
							value={trInputVal}
							onChange={(e) => {
								setTrInputVal(e.target.value);
							}}
						/>
					</div>
				</div>
				{/* 
        <div className="flex col-span-1 items-end">
          <Button
            className="flex w-full h-10 items-center justify-center"
            disabled={!trInputVal}
            intent="secondary"
            type="button"
            onClick={(e) => {
              setValue(ids.letterTranscriptions, [
                ...(fields[ids.letterTranscriptions] ?? []),
                trInputVal,
              ]);

              setTrInputVal("");
            }}>
            <FaPlus className="me-2" />
            افزودن
          </Button>
        </div> */}

				{/* <div className="flex px-6 py-3 border-s-4 border-gray-200 rounded-xl bg-gray-50 col-span-6 col-start-1">
          <label>رونوشت ها:</label>
          <div className="ms-8">
            {fields[ids.letterTranscriptions] &&
            fields[ids.letterTranscriptions]!.length !== 0 ? (
              fields[ids.letterTranscriptions]!.map((trancription) => (
                <div className="mt-1.5 first:mt-0" key={trancription}>
                  <div className="flex items-center">
                    <div>
                      <FaTimes
                        className="w-4 h-4 p-0.5 rounded bg-gray-200 cursor-pointer transition-colors hover:bg-red-100 hover:text-red-900"
                        onClick={() => {
                          setValue(
                            ids.letterTranscriptions,
                            (() => {
                              if (
                                fields[ids.letterTranscriptions]?.length === 1
                              ) {
                                return undefined;
                              }

                              return [
                                ...fields[ids.letterTranscriptions]!.filter(
                                  (x) => x !== trancription
                                ),
                              ];
                            })()
                          );
                        }}
                      />
                    </div>
                    <div className="ms-2">{trancription}</div>
                  </div>
                </div>
              ))
            ) : (
              <>-</>
            )}
          </div>
        </div> */}

				<div className="col-span-9 col-start-1 flex items-center justify-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1">
					<Template
						date={moment(fields[ids.letterDate]).format("jYYYY/jMM/jDD")}
						no={task.caseNo}
						isFile={fields[ids.isFile]}
					/>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* inspection */}
				<div className="col-span-3">
					<label>شماره درخواست بازرسی:</label>
					<div className="mt-2">
						<Input
							defaultValue={task.data[ids.relatedInspectionCaseNo]}
							disabled
						/>
					</div>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* followings */}
				<div className="col-span-3 col-start-1">
					<label>پیرو نامه (ها):</label>
					<div className="mt-2">
						<Input defaultValue={task.data[ids.letterFollowingOfs]} disabled />
					</div>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* next */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterReviewByDirectorStatus}>نتیجه بررسی:</label>
					<div className="mt-2">
						<Select
							id={ids.letterReviewByDirectorStatus}
							items={reviewStatuses}
							value={fields[ids.letterReviewByDirectorStatus]}
							onBlur={() => {
								trigger(ids.letterReviewByDirectorStatus);
							}}
							onMutate={(v) => {
								setValue(ids.letterReviewByDirectorStatus, v!, {
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								});
							}}
						/>
						<FieldError error={errors[ids.letterReviewByDirectorStatus]} />
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<label htmlFor={ids.letterReviewByDirectorNote}>توضیحات بررسی:</label>
					<div className="mt-2">
						<Textarea
							id={ids.letterReviewByDirectorNote}
							{...register(ids.letterReviewByDirectorNote)}
						/>
						<FieldError error={errors[ids.letterReviewByDirectorNote]} />
					</div>
				</div>
			</div>
		</>
	);
}
