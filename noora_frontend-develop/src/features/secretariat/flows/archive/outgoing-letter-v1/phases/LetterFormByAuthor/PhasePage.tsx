"use client";

import moment from "moment-jalaali";
import { useEffect, useRef, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Controller, useFormContext } from "react-hook-form";
import { FaCalendarAlt, FaCaretLeft, FaPlus, FaTimes } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select, SelectDynamic } from "@/form/select";
import { Textarea } from "@/form/textarea";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import { messages } from "@/messages";
import { compareById } from "@/utils";

import { InspectionCaseNosWidget } from "../../components/InspectionCaseNosWidget";
import { Template } from "../../components/template";
import {
	archiveOptions,
	Assignee,
	confidentialityOptions,
	fileOption,
	ids,
	priorityOptions,
	sendTypes,
} from "../../data";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const {
		formState: { errors },
		register,
		setValue,
		trigger,
		watch,
	} = useFormContext<FormData>();

	const fields = watch();

	const { [ids.assignees]: assignees } = fields;

	const [trInputVal, setTrInputVal] = useState<string>("");
	const trAddBtn = useRef<HTMLButtonElement>(null);

	const [rnInputVal, setRnInputVal] = useState<string>("");
	const [raInputVal, setRaInputVal] = useState<string>("");
	const recipientAddBtn = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.assignees);

		register(`${ids.assignees}.Manager`, {
			required: {
				message: messages.validation.required,
				value: true,
			},
		});

		register(ids.letterPriority, {
			required: { value: true, message: messages.validation.required },
		});

		register(ids.letterConfidentiality, {
			required: { value: true, message: messages.validation.required },
		});

		register(ids.letterBody);

		register(ids.letterTranscriptions);

		register(ids.recipients);

		register(ids.needsToBeArchived, {
			required: { value: true, message: messages.validation.required },
		});
	}, [register]);

	useEffect(() => {
		if (!assignees) {
			setValue(ids.assignees, {});
		}
	}, [assignees, setValue]);

	useEffect(() => {
		hooks.registerHook("pre-submit", ({ data }) => {
			if (!data[ids.assignees]["Author"]) {
				const { id, fullname: name } = identity!;
				data[ids.assignees]["Author"] = { id, name };
			}
		});

		hooks.registerHook("submit", async ({ task, data }) => {
			if (!task.data[ids.assignees]?.["Manager"]) {
				await addWatcherToInstance(
					task.instanceId,
					data[ids.assignees]["Manager"].id,
				);
			}
		});

		return () => hooks.removeAll();
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{/* reject */}
				{task.data[ids.letterReviewByManagerNote] && (
					<div className="col-span-full">
						<DestructiveAlert>
							<AlertDescription>
								<div className="font-bold">
									{task.data[ids.assignees].Manager.name}:
								</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.letterReviewByManagerNote]}
								</div>
							</AlertDescription>
						</DestructiveAlert>
					</div>
				)}

				{/* seperator */}
				{task.data[ids.letterReviewByManagerNote] && (
					<div className="col-span-full mt-5">
						<div className="h-1 bg-gray-100"></div>
					</div>
				)}

				{/* options */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterPriority}>اولویت نامه:</label>
					<div className="mt-2">
						<Select
							id={ids.letterPriority}
							items={priorityOptions}
							value={fields[ids.letterPriority]}
							onLeave={() => {
								trigger(ids.letterPriority);
							}}
							onMutate={(v) => {
								setValue(ids.letterPriority, v!, {
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								});
							}}
						/>
						<FieldError error={errors[ids.letterPriority]} />
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

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterConfidentiality}>پیوست:</label>
					<div className="mt-2">
						<Select
							id={ids.isFile}
							items={fileOption}
							value={fields[ids.isFile]}
							onLeave={() => {
								trigger(ids.isFile);
							}}
							onMutate={(v) => {
								setValue(ids.isFile, v!, {
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
                setValue(ids.letterTranscriptions, e?.target?.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  trAddBtn.current!.click();
                }
              }}
            />
          </div>
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

				{/* relation */}
				<InspectionCaseNosWidget />

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* followings */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.letterFollowingOfs}>پیرو نامه (ها):</label>
					<Input
						className="mt-2"
						id={ids.letterFollowingOfs}
						{...register(ids.letterFollowingOfs)}
						onChange={(e) => {
							setValue(
								ids.letterFollowingOfs,
								e.target.value
									?.split(",")
									.map((x) => x.trim())
									.join(","),
								{
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								},
							);
						}}
					/>
					<div className="mt-2 text-xs text-gray-500">
						در صورت وجود چندین شماره نامه، شماره ها با کاما (,) جدا شوند.
					</div>
					<FieldError error={errors[ids.letterFollowingOfs]} />
				</div>

				{false && (
					<div className="col-span-9 flex flex-col justify-center">
						{fields[ids.letterFollowingOfs] &&
							fields[ids.letterFollowingOfs]?.split(",").map((x: any) => {
								return <div key={x}>نامه شماره {x}</div>;
							})}
					</div>
				)}

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* order */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.sendType}>نحوه ارسال:</label>
					<div className="mt-2">
						<Select
							id={ids.sendType}
							items={sendTypes}
							optional
							value={fields[ids.sendType]}
							onLeave={() => {
								trigger(ids.sendType);
							}}
							onMutate={(v) => {
								setValue(ids.sendType, v, {
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								});

								setValue(ids.recipients, undefined, {
									shouldDirty: true,
									shouldTouch: true,
								});

								setRnInputVal("");
								setRaInputVal("");
							}}
						/>
						<FieldError error={errors[ids.sendType]} />
					</div>
				</div>

				{fields[ids.sendType] && (
					<>
						{fields[ids.sendType] === "physical" ? (
							<>
								<div className="col-span-3 col-start-1">
									<label htmlFor="recipientName">نام گیرنده:</label>
									<div className="mt-2">
										<Input
											id="recipientName"
											value={rnInputVal}
											onChange={(e) => {
												setRnInputVal(e.target.value);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													recipientAddBtn.current!.click();
												}
											}}
										/>
									</div>
								</div>

								<div className="col-span-5">
									<label htmlFor="recipientAddress">آدرس گیرنده:</label>
									<div className="mt-2">
										<Input
											id="recipientAddress"
											value={raInputVal}
											onChange={(e) => {
												setRaInputVal(e.target.value);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													recipientAddBtn.current!.click();
												}
											}}
										/>
									</div>
								</div>

								<div className="col-span-1 flex items-end">
									<Button
										className="flex h-10 w-full items-center justify-center"
										disabled={!raInputVal || !rnInputVal}
										ref={recipientAddBtn}
										type="button"
										onClick={(e) => {
											setValue(ids.recipients, [
												...(fields[ids.recipients] ?? []),
												{ name: rnInputVal, address: raInputVal },
											]);

											setRnInputVal("");
											setRaInputVal("");
										}}
									>
										<FaPlus className="me-2" />
										افزودن
									</Button>
								</div>
							</>
						) : (
							<>
								<div className="col-span-3 col-start-1">
									<label htmlFor="recipientAddress">
										پست الکترونیک گیرنده:
									</label>
									<div className="mt-2">
										<Input
											id="recipientAddress"
											value={raInputVal}
											onChange={(e) => {
												setRaInputVal(e.target.value);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													recipientAddBtn.current!.click();
												}
											}}
										/>
									</div>
								</div>

								<div className="col-span-1 flex items-end">
									<Button
										className="flex h-10 w-full items-center justify-center"
										disabled={!raInputVal}
										ref={recipientAddBtn}
										type="button"
										onClick={(e) => {
											setValue(ids.recipients, [
												...(fields[ids.recipients] ?? []),
												{ address: raInputVal },
											]);

											setRaInputVal("");
										}}
									>
										<FaPlus className="me-2" />
										افزودن
									</Button>
								</div>
							</>
						)}

						<div className="col-span-9 col-start-1 flex rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
							<label>گیرندگان:</label>
							<div className="ms-8">
								{fields[ids.recipients] &&
								fields[ids.recipients]!.length !== 0 ? (
									fields[ids.recipients]!.map((recipient: any, i: number) => (
										<div className="mt-1.5 first:mt-0" key={i}>
											{fields[ids.sendType] === "physical" ? (
												<div className="flex items-center">
													<div>
														<FaTimes
															className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
															onClick={() => {
																setValue(ids.recipients, [
																	...fields[ids.recipients]!.filter(
																		(x: any) => x.name !== recipient.name,
																	),
																]);
															}}
														/>
													</div>

													<div className="ms-2 flex items-center">
														{recipient.name}
														<FaCaretLeft className="mx-2 h-2 w-2" />
														{recipient.address}
													</div>
												</div>
											) : (
												<div className="flex items-center">
													<div>
														<FaTimes
															className="h-4 w-4 cursor-pointer rounded bg-gray-200 p-0.5 transition-colors hover:bg-red-100 hover:text-red-900"
															onClick={() => {
																setValue(ids.recipients, [
																	...fields[ids.recipients]!.filter(
																		(x: any) => x.address !== recipient.address,
																	),
																]);
															}}
														/>
													</div>

													<div className="ms-2">{recipient.address}</div>
												</div>
											)}
										</div>
									))
								) : (
									<>-</>
								)}
							</div>
						</div>
					</>
				)}

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.needsToBeArchived}>نیاز به بایگانی فیزیکی:</label>
					<div className="mt-2">
						<Select
							id={ids.needsToBeArchived}
							items={archiveOptions}
							value={fields[ids.needsToBeArchived]}
							onLeave={() => {
								trigger(ids.needsToBeArchived);
							}}
							onMutate={(v) => {
								setValue(ids.needsToBeArchived, v!, {
									shouldDirty: true,
									shouldTouch: true,
									shouldValidate: true,
								});
							}}
						/>
						<FieldError error={errors[ids.needsToBeArchived]} />
					</div>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* next */}
				<div className="col-span-3 col-start-1">
					<label htmlFor={`${ids.assignees}.Manager`}>ارسال برای:</label>
					<div className="mt-2">
						{task.data[ids.assignees]?.Manager ? (
							<Input
								defaultValue={task.data[ids.assignees].Manager.name}
								disabled
							/>
						) : (
							<>
								<SelectDynamic<Assignee>
									id={`${ids.assignees}.Manager`}
									value={fields[ids.assignees]?.["Manager"] as Assignee}
									onCompare={compareById}
									onLeave={() => {
										trigger(`${ids.assignees}.Manager`);
									}}
									onMutate={(v) => {
										setValue(`${ids.assignees}.Manager`, v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									onSearch={async (v) => {
										return await getUsers({
											filters: { ...searchUserFullname(v) },
										}).then((users) => {
											return users.map((user) => ({
												id: user.id,
												name: user.fullname,
											}));
										});
									}}
								/>
								<FieldError error={errors[ids.assignees]?.Manager} />
							</>
						)}
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<label htmlFor={ids.letterFormByAuthorNote}>توضیحات:</label>
					<div className="mt-2">
						<Textarea
							id={ids.letterFormByAuthorNote}
							{...register(ids.letterFormByAuthorNote)}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
