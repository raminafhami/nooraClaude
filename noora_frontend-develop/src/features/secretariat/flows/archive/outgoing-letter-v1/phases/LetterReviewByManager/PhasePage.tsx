"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Controller, useFormContext } from "react-hook-form";
import { FaCalendarAlt, FaCaretLeft, FaCheck, FaTimes } from "react-icons/fa";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { messages } from "@/messages";

import { StaticTemplate, Template } from "../../components/template";
import {
	archiveOptions,
	confidentialityOptions,
	ids,
	priorityOptions,
	sendTypes,
} from "../../data";
import {
	approvedReviewStatuses,
	rejectedReviewStatuses,
	reviewStatuses,
} from "./PhaseData";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { [ids.letterReviewByDirectorStatus]: directorReviewStatus } =
		task.data;

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
		register(ids.letterNo);

		register(ids.letterDate);

		register(ids.letterConfidentiality, {
			required: { value: true, message: messages.validation.required },
		});

		register(ids.letterBody);

		register(ids.letterSignature);

		register(ids.letterReviewByManagerStatus, {
			required: { value: true, message: messages.validation.required },
		});
	}, [register]);

	useEffect(() => {
		setValue(ids.letterNo, task.caseNo);
	}, [task.caseNo, setValue]);

	useEffect(() => {
		if (directorReviewStatus) {
			if (directorReviewStatus === "confirm") {
				setValue(
					ids.letterReviewByManagerStatus,
					approvedReviewStatuses.at(0)!.value,
				);
			} else {
				setValue(ids.letterReviewByManagerStatus, "");
			}
		}
	}, [directorReviewStatus, setValue]);

	useEffect(() => {
		hooks.registerHook("pre-submit", ({ data }) => {
			if (
				data[ids.letterReviewByManagerStatus] === "pending" &&
				!data[ids.assignees]["Director"]
			) {
				const { id, fullname: name } = identity!;
				data[ids.assignees]["Director"] = { id, name };
			}
		});

		hooks.registerHook(
			"pre-submit",
			({ task, data }: { task: Task; data: FormData }) => {
				if (data[ids.letterReviewByManagerStatus] === "approved") {
					data[ids.letterNo] = task.caseNo;
					if (!data[ids.letterDate]) {
						data[ids.letterDate] = new DateObject({
							date: new Date(),
							format: "YYYY/MM/DD",
						}).toString();
					}
				}
			},
		);

		hooks.registerHook("pre-submit", ({ data }: { data: FormData }) => {
			if (
				data[ids.letterReviewByManagerStatus] === "confirm" &&
				!data[ids.letterSignature]
			) {
				data[ids.letterSignature] = `Signed by Manager ${
					data[ids.assignees].Manager?.name
				}`;
			}
		});

		hooks.registerHook("pre-submit", ({ data }) => {
			const letterPages = (
				<StaticTemplate
					date={
						data[ids.letterDate]
							? moment(data[ids.letterDate]).format("jYYYY/jMM/jDD")
							: moment(new Date()).format("jYYYY/jMM/jDD")
					}
					no={data[ids.letterNo]}
					name={data[ids.letterToName]}
					position={data[ids.letterToPosition] ?? undefined}
					subject={data[ids.letterSubject] ?? undefined}
					body={data[ids.letterBody]}
					transcriptions={data[ids.letterTranscriptions] ?? undefined}
				/>
			);

			const root = document.createElement("div");
			flushSync(() => {
				createRoot(root).render(letterPages);
			});
			data["LetterPages"] = root.innerHTML;

			// const root = document.createElement("div");
			// ReactDOM.render(letterPages, root);
			// data["LetterPages"] = root.innerHTML;
		});

		hooks.registerHook("submit", async ({ task, data }) => {
			if (
				data[ids.letterReviewByManagerStatus] === "pending" &&
				!task.data[ids.assignees]?.["Director"]
			) {
				await addWatcherToInstance(
					task.instanceId,
					data[ids.assignees]["Director"].id,
				);
			}
			if (
				data[ids.letterReviewByManagerStatus] === "approved" &&
				!data[ids.letterDate]
			) {
				data[ids.letterDate] = new DateObject().toString();
			}
		});

		return () => hooks.removeAll();
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{/* reject */}
				{task.data[ids.letterReviewByDirectorNote] && (
					<div className="col-span-full">
						<Alert
							variant={
								task.data[ids.letterReviewByDirectorStatus] === "confirm"
									? "success"
									: "destructive"
							}
						>
							<AlertDescription>
								<div className="font-bold">
									{task.data[ids.assignees].Director!.name}:
								</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.letterReviewByDirectorNote]}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				)}

				{/* referrer */}
				{task.data[ids.letterFormByAuthorNote] && (
					<div className="col-span-full">
						<Alert variant="info">
							<AlertDescription>
								<div className="font-bold">
									{task.data[ids.assignees].Author!.name}:
								</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.letterFormByAuthorNote]}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				)}

				{/* seperator */}
				{(task.data[ids.letterFormByAuthorNote] ||
					task.data[ids.letterReviewByDirectorNote]) && (
					<div className="col-span-full">
						<div className="h-1 bg-gray-100"></div>
					</div>
				)}

				{/* options */}
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

				{/* <div className="col-span-5 col-start-1">
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
        </div> */}

				{/* <div className="flex col-span-1 items-end">
          <Button
            className="flex w-full h-10 items-center justify-center"
            disabled={!trInputVal}
            intent="secondary"
            type="button"
            onClick={() => {
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
						date={
							fields[ids.letterDate]
								? moment(fields[ids.letterDate]).format("jYYYY/jMM/jDD")
								: moment(new Date()).format("jYYYY/jMM/jDD")
						}
						no={task.caseNo}
						isFile={task.data[ids.isFile]}
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

				{/* order */}
				{task.data[ids.sendType] && (
					<>
						<div className="col-span-3 col-start-1">
							<label>روش ارسال:</label>
							<div className="mt-2">
								<Input
									defaultValue={
										sendTypes.find((x) => x.value === task.data[ids.sendType])!
											.label
									}
									disabled
								/>
							</div>
						</div>

						{task.data[ids.sendType] && (
							<>
								<div className="col-span-9 col-start-1 flex rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
									<label>گیرندگان:</label>
									<div className="ms-8">
										{task.data[ids.recipients] &&
										task.data[ids.recipients]!.length !== 0 ? (
											task.data[ids.recipients]!.map(
												(recipient: any, i: number) => (
													<div className="mt-1.5 first:mt-0" key={i}>
														{task.data[ids.sendType] === "physical" ? (
															<div className="flex items-center">
																{recipient.name}
																<FaCaretLeft className="mx-2 h-2 w-2" />
																{recipient.address}
															</div>
														) : (
															<div className="flex items-center">
																<div>{recipient.address}</div>
															</div>
														)}
													</div>
												),
											)
										) : (
											<>-</>
										)}
									</div>
								</div>
							</>
						)}
					</>
				)}

				<div className="col-span-3 col-start-1">
					<label>نیاز به بایگانی فیزیکی:</label>
					<div className="mt-2">
						<Input
							defaultValue={
								archiveOptions.find(
									(x) => x.value === task.data[ids.needsToBeArchived],
								)!.label
							}
							disabled
						/>
					</div>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* next */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterReviewByManagerStatus}>نتیجه بررسی:</label>
					<div className="mt-2">
						{task.data[ids.letterReviewByDirectorStatus] === "confirm" ? (
							<>
								<Alert variant="info">
									<FaCheck />
									<AlertDescription>
										تایید توسط {task.data[ids.assignees]["Approver"]!.name}
									</AlertDescription>
								</Alert>
								<Input className="mt-2" defaultValue="تایید" disabled />
							</>
						) : (
							<>
								{task.data[ids.letterReviewByDirectorStatus] === "reject" && (
									<Alert className="mb-2" variant="destructive">
										<FaTimes />
										<AlertDescription>
											رد شده توسط {task.data[ids.assignees]["Director"]!.name}
										</AlertDescription>
									</Alert>
								)}
								<Select
									id={ids.letterReviewByManagerStatus}
									items={(() => {
										const status = task.data[ids.letterReviewByDirectorStatus];

										if (status === "confirm") {
											return approvedReviewStatuses;
										} else if (status === "reject") {
											return rejectedReviewStatuses;
										}

										return reviewStatuses;
									})()}
									value={fields[ids.letterReviewByManagerStatus]}
									onLeave={() => {
										trigger(ids.letterReviewByManagerStatus);
									}}
									onMutate={(v) => {
										setValue(ids.letterReviewByManagerStatus, v!, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
								/>
								<FieldError error={errors[ids.letterReviewByManagerStatus]} />
							</>
						)}
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<label htmlFor={ids.letterReviewByManagerNote}>توضیحات بررسی:</label>
					<div className="mt-2">
						<Textarea
							id={ids.letterReviewByManagerNote}
							{...register(ids.letterReviewByManagerNote)}
						/>
						<FieldError error={errors[ids.letterReviewByManagerNote]} />
					</div>
				</div>
			</div>
		</>
	);
}
