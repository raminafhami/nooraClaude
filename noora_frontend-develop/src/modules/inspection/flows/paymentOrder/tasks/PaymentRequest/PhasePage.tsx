"use client";

import "num2persian";

import moment from "jalali-moment";
import {
	addCommas,
	getBankNameFromCardNumber,
	getShebaInfo,
	isShebaValid,
	verifyCardNumber,
} from "persian-tools";
import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useFormContext, UseFormSetValue } from "react-hook-form";
import { AiOutlineCheck } from "react-icons/ai";
import { PiNumberCircleOneBold, PiNumberCircleTwoBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";
import { z } from "zod";

import GetInstanceFile from "@/api/inspection/getInstanceFile";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { cancelCostsPayment } from "@/financial/costs/services/cancelCostsPayment";
import { MaskInput } from "@/form/MaskInput";
import { UserApi } from "@/identity/users/models/User";
import { currencies } from "@/inspection/models/Currencies";

import FindUser from "../../components/FindUser";
import { Ids } from "../../data";
import { PaymentPriority } from "../../data/PaymentPriority";
import { PaymentTyps } from "../../data/PaymentTypes";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

interface formAttribuiteProps {
	paymentDate?: string | DateObject;
}

const CancelOrder = ({
	isCancel,
	setValue,
}: {
	isCancel: boolean;
	setValue: UseFormSetValue<any>;
}) => {
	return (
		<div className="my-2 flex w-fit items-center rounded-xl bg-gray-100 p-2">
			<Checkbox
				className="mx-1"
				defaultChecked={isCancel}
				onCheckedChange={(e) =>
					setValue("IsCancel", e === true ? "true" : "false")
				}
			></Checkbox>
			<Label className="mx-1">لغو درخواست</Label>
		</div>
	);
};

const CashPay = ({
	cashPay,
	setValue,
}: {
	cashPay: boolean;
	setValue: UseFormSetValue<any>;
}) => {
	return (
		<div className="flex w-full items-center justify-center">
			<span className="text-whiterounded-xl my-2 flex w-fit items-center rounded-2xl border border-gray-200 p-2">
				<Checkbox
					className="mx-1 bg-white"
					defaultChecked={cashPay}
					onCheckedChange={(e) =>
						setValue("CashPay", e === true ? "true" : "false")
					}
				></Checkbox>
				<Label className="mx-1">پرداخت نقدی</Label>
			</span>
		</div>
	);
};

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { setValue, watch, register } = useFormContext<FormData>();

	const fields = watch();

	const {
		task: { instanceId },
		hooks,
	} = useTaskContext();

	const [formAttribuite, setFormAttribuite] = useState<formAttribuiteProps>();
	const [requieres, setRequieres] = useState<boolean>(false);
	const [userData, setUserData] = useState<UserApi | undefined>(
		fields[Ids.userInformation],
	);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (formAttribuite?.paymentDate) {
			setValue(Ids.paymentDate, formAttribuite.paymentDate?.toString());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formAttribuite]);

	useEffect(() => {
		setValue("UserData", identity.fullname);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (userData && watch()?.InputType === "official") {
			setValue("UserInformation", userData);
		}
	}, [userData]);

	useEffect(() => {
		if (watch()?.InputType === "personal") {
			setValue("UserInformation", undefined);
			setUserData(undefined);
		}
	}, [watch()?.InputType]);

	useEffect(() => {
		if (watch()?.ProcessType !== "beneficiary" && !watch()?.UserInformation) {
			setValue("InputType", "personal");
		}
	}, []);

	useEffect(() => {
		hooks.registerHook("pre-submit", async ({ data, task }) => {
			if (!data?.IsCancel || data?.IsCancel === "false") {
				let res = await GetInstanceFile({ processInstanceId: task.instanceId });
				if (
					res?.result?.files?.length === 0 &&
					data?.ProcessType !== "beneficiary"
				) {
					toast.info("از قسمت مدارک فایل مورد نظر خود را بارگزاری کنید");
					throw new Error("فایل انتخاب نشده است");
				}

				if (
					data.Currency === "rial" &&
					data.CashPay === "false" &&
					data?.InputType === "official" &&
					!data?.UserInformation?.nationalCode
				) {
					throw new Error("کد ملی ثبت نشده است");
				}

				if (
					!data.Amount ||
					!data.Title ||
					!data.Currency ||
					!data.Description ||
					!data.PaymentDate ||
					(data.Currency === "rial" &&
						data.CashPay === "false" &&
						!data.BankAccountsOwner) ||
					!data.Priority ||
					!data.ProcessType
				) {
					throw setRequieres(true);
				}
				if (data.Currency === "rial" && data.CashPay === "false") {
					if (
						(data.Amount >= 50000000 && data.Sheba?.length !== 24) ||
						!data.BankAccountsOwner
					) {
						throw setRequieres(true);
					}
					if (
						data.BankCardNumber?.length !== 16 &&
						data.Amount <= 50000000 &&
						!data.Sheba
					) {
						throw setRequieres(true);
					}
				}
			}
		});

		hooks.registerHook("submit", async ({ task, data }) => {
			if (data?.IsCancel === "true") {
				let update = await cancelCostsPayment({
					instanceId: instanceId,
				});
				setStageOfInstance(task.instanceId, "paymentOrder-cancel");
			} else {
				setStageOfInstance(task.instanceId, "paymentOrder-review");
			}
		});

		if (!fields[Ids.priority]) {
			setValue(Ids.priority, "high");
		}
	}, []);

	return (
		<>
			<CancelOrder
				isCancel={fields[Ids.isCancel] === "true"}
				setValue={setValue}
			/>

			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<div className="col-span-9 col-start-1 flex items-center justify-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1">
					<div className="flex w-full flex-wrap p-2">
						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">واحد پول</Label>
							<Select
								onValueChange={(value) => setValue("Currency", value)}
								value={fields[Ids.currency]}
								disabled={fields[Ids.processType] === "beneficiary"}
							>
								<SelectTrigger
									className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
										requieres && !fields[Ids.currency]
											? "border-red-500"
											: "border-white"
									}`}
								>
									<SelectValue placeholder="انتخاب" />
								</SelectTrigger>
								<SelectContent>
									{currencies.map((currency) => (
										<SelectItem value={currency.value} key={currency.value}>
											<span className="px-2">{currency.label}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="relative m-2 flex w-[300px] flex-col">
							<Label className="m-1">مبلغ</Label>
							<input
								disabled={fields[Ids.processType] === "beneficiary"}
								dir="ltr"
								onChange={(event) =>
									setValue(
										Ids.amount,
										event.target.value.slice(0, 21).replace(/\D/g, ""),
										{
											shouldValidate: true,
										},
									)
								}
								value={
									fields[Ids.amount]
										? addCommas(fields[Ids.amount]?.toLocaleString())
										: watch().Amount
								}
								className={`group relative w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
									requieres && !fields[Ids.amount]
										? "border-red-500"
										: "border-white"
								}`}
								placeholder={"17,000,000"}
							/>
							{fields[Ids.currency] && (
								<span className="absolute left-[1rem] top-[2.3rem] text-[1rem] text-gray-400">
									{fields[Ids.currency] === "dollar"
										? "دلار"
										: fields[Ids.currency] === "euro"
											? "یورو"
											: fields[Ids.currency] === "rial"
												? "ریال"
												: "یوان"}
								</span>
							)}
						</div>

						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">عنوان</Label>
							<input
								onChange={(event) =>
									setValue(Ids.title, event.target.value, {
										shouldValidate: true,
									})
								}
								disabled={fields[Ids.processType] === "beneficiary"}
								value={fields[Ids.title]}
								className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
									requieres && !fields[Ids.title]
										? "border-red-500"
										: "border-white"
								}`}
								placeholder={"عنوان"}
							/>
						</div>

						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">تاریخ پرداخت</Label>
							<DatePicker
								calendar={persian}
								locale={persian_fa}
								inputClass={`w-full text-[.9rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0 ${
									requieres && !fields[Ids.paymentDate]
										? "border-red-500"
										: "border-white"
								}`}
								placeholder="تاریخ پرداخت"
								calendarPosition="bottom"
								onFocusedDateChange={(dateFocused, dateClicked) =>
									setFormAttribuite((prev) => ({
										...prev,
										paymentDate: dateClicked,
									}))
								}
								value={
									formAttribuite?.paymentDate
										? formAttribuite?.paymentDate
										: watch().PaymentDate
								}
								minDate={moment(new Date()).locale("fa").format("YYYY/MM/DD")}
							/>
						</div>

						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">اولویت پرداخت</Label>
							<Select
								onValueChange={(value) =>
									setValue(Ids.priority, value, {
										shouldValidate: true,
									})
								}
								value={fields[Ids.priority]}
							>
								<SelectTrigger
									className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
										requieres && !fields[Ids.priority]
											? "border-red-500"
											: "border-white"
									}`}
								>
									<SelectValue placeholder="انتخاب" />
								</SelectTrigger>
								<SelectContent>
									{PaymentPriority.map((priority, index: number) => (
										<SelectItem value={priority.value} key={index}>
											<span className="px-2">{priority.label}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">دسته بندی</Label>
							<Select
								disabled={fields[Ids.processType] === "beneficiary"}
								onValueChange={(value) =>
									setValue(Ids.processType, value, {
										shouldValidate: true,
									})
								}
								value={fields[Ids.processType]}
							>
								<SelectTrigger
									className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
										requieres && !fields[Ids.processType]
											? "border-red-500"
											: "border-white"
									}`}
								>
									<SelectValue placeholder="انتخاب" />
								</SelectTrigger>
								<SelectContent>
									{PaymentTyps.map((type, index: number) => (
										<SelectItem
											disabled={type?.value === "beneficiary"}
											value={type.value}
											key={index}
										>
											<span className="px-2">{type.label}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">توضیحات</Label>
							<textarea
								onChange={(event) =>
									setValue(Ids.description, event.target.value, {
										shouldValidate: true,
									})
								}
								disabled={fields[Ids.processType] === "beneficiary"}
								value={fields[Ids.description]}
								className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
									requieres && !fields[Ids.description]
										? "border-red-500"
										: "border-white"
								}`}
								placeholder={"توضیحات ..."}
							/>

							{/* {watch().PayDes && (
                <>
                  <Label className="m-1">توضیحات</Label>
                  <textarea
                    readOnly
                    disabled
                    value={`مالی: ${watch().PayDes}`}
                    className={`text-gray-400 cursor-default h-[10rem] resize-none mx-[2rem] text-[1rem] my-[2rem] pl-[2.8rem] pr-[.5rem] border-white border-1 bg-white rounded-[.5rem] group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0`}
                    placeholder={"توضیحات مالی..."}
                  />
                </>
              )} */}
						</div>

						{watch().ReviewDes && (
							<div className="m-2 flex w-[300px] flex-col">
								<Label className="m-1">توضیحات مدیر</Label>
								<textarea
									readOnly
									disabled
									value={`${watch().ReviewDes}`}
									className={`border-1 group relative h-[10rem] cursor-default resize-none text-ellipsis rounded-[.5rem] border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] text-gray-400 placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
									placeholder={"توضیحات مدیر..."}
								/>
							</div>
						)}

						{watch().PayDes && (
							<div className="m-2 flex w-[300px] flex-col">
								<Label className="m-1">توضیحات مالی</Label>
								<textarea
									disabled
									onChange={(event) =>
										setValue(Ids.payDes, event.target.value, {
											shouldValidate: true,
										})
									}
									value={fields[Ids.payDes]}
									className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] text-gray-400 placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
									placeholder={"توضیحات ..."}
								/>
							</div>
						)}

						<div className="relative m-2 flex w-[300px] flex-col">
							{requieres && +fields[Ids.amount] >= 50000000 && (
								<span
									className={`group relative mb-[2rem] text-ellipsis rounded px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] text-red-600 placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								>
									*وارد کردن شبا و نام صاحب حساب ضرروری است!
								</span>
							)}

							<div className="mb-4 flex items-center justify-center rounded-2xl border py-2">
								<Label className="mx-2">کاربران سیستمی</Label>
								<Switch
									defaultChecked={
										watch()?.InputType === "official" ? false : true
									}
									// disabled={fields[Ids.processType] === "beneficiary"}
									onCheckedChange={(v) =>
										setValue("InputType", v ? "personal" : "official")
									}
								/>
								<Label className="mx-2">سایر</Label>
							</div>
							<CashPay
								cashPay={fields[Ids.cashPay] === "true"}
								setValue={setValue}
							/>
							{watch()?.InputType === "official" && (
								<FindUser
									open={open}
									setOpen={setOpen}
									setUser={setUserData}
									user={userData}
								/>
							)}

							{fields[Ids.currency] === "rial" &&
								(fields[Ids.cashPay] === "false" || !fields[Ids.cashPay]) && (
									<>
										<Accordion type="multiple">
											<AccordionItem value="shebaMethod" className="mx-2">
												<AccordionTrigger
													className={`btn flex items-center rounded-2xl bg-blue-500 px-4 py-2 text-white ${
														fields[Ids.bankSheba]?.length === 20
															? "bg-green-500"
															: requieres &&
																  fields[Ids.bankSheba]?.length !== 20 &&
																  +fields[Ids.amount] >= 50000000
																? "bg-red-500"
																: "hover:bg-blue-700"
													}`}
												>
													<PiNumberCircleOneBold className="ml-2" size={15} />
													پرداخت به شماره شبا
												</AccordionTrigger>
												<AccordionContent>
													<div className="relative my-2">
														<MaskInput
															dir="ltr"
															mask={"IR 00 0000 0000 0000 0000 0000 00"}
															disabled={watch()?.InputType === "official"}
															onMutate={(v) => setValue(Ids.bankSheba, v)}
															value={
																fields[Ids.bankSheba]
																	? `${fields[Ids.bankSheba]?.slice(
																			0,
																			2,
																		)} ${fields[Ids.bankSheba]?.slice(
																			2,
																			5,
																		)} ${fields[Ids.bankSheba]?.slice(5)}`
																	: undefined
															}
															className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
																requieres &&
																fields[Ids.bankSheba]?.length !== 20 &&
																+fields[Ids.amount] >= 50000000
																	? "border-red-500"
																	: "border-white"
															}`}
															placeholder={"شماره شبا"}
														/>

														<span className="absolute right-[1rem] top-[1.2rem] select-none text-[1rem]">
															{fields[Ids.bankSheba] &&
															isShebaValid(`IR${fields[Ids.bankSheba]}`) ? (
																<AiOutlineCheck
																	className="inline text-green-500"
																	size={15}
																/>
															) : (
																<RxCross2
																	className="inline text-red-500"
																	size={15}
																/>
															)}
														</span>
														{fields[Ids.bankSheba] && (
															<span className="mr-2 max-w-[85%] text-gray-400">
																{getShebaInfo(`IR${fields[Ids.bankSheba]}`)
																	?.persianName
																	? getShebaInfo(`IR${fields[Ids.bankSheba]}`)
																			?.persianName
																	: "یافت نشد..."}
															</span>
														)}
													</div>
												</AccordionContent>
											</AccordionItem>
											<AccordionItem value="cardMethod" className="mx-2">
												<AccordionTrigger
													className={`btn my-2 flex items-center rounded-2xl bg-blue-500 px-4 py-2 ${
														fields[Ids.bankCardNumber]?.length === 16
															? "bg-green-500"
															: requieres &&
																  fields[Ids.bankCardNumber]?.length !== 16 &&
																  +fields[Ids.amount] <= 50000000 &&
																  fields[Ids.bankSheba]?.length !== 20
																? "bg-red-500"
																: "hover:bg-blue-700"
													} text-white`}
												>
													<PiNumberCircleTwoBold className="ml-2" size={15} />
													پرداخت به شماره کارت
												</AccordionTrigger>
												<AccordionContent>
													<div className="relative my-2 mb-6">
														<MaskInput
															dir="ltr"
															disabled={watch()?.InputType === "official"}
															mask={"0000 0000 0000 0000"}
															onMutate={(v) =>
																setValue(Ids.bankCardNumber, v, {
																	shouldValidate: true,
																})
															}
															onKeyDown={() => null}
															value={
																fields[Ids.bankCardNumber]
																	? `${fields[Ids.bankCardNumber]?.slice(
																			0,
																			4,
																		)} ${fields[Ids.bankCardNumber]?.slice(
																			4,
																			8,
																		)} ${fields[Ids.bankCardNumber]?.slice(
																			8,
																			12,
																		)} ${fields[Ids.bankCardNumber]?.slice(
																			12,
																			16,
																		)}`
																	: undefined
															}
															className={`group relative mb-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
																requieres &&
																fields[Ids.bankCardNumber]?.length !== 16 &&
																+fields[Ids.amount] <= 50000000
																	? "border-red-500"
																	: "border-white"
															}`}
															placeholder={"شماره کارت"}
														/>
														<span className="absolute right-[1rem] top-[.7rem] select-none text-[1rem]">
															{fields[Ids.bankCardNumber] &&
															verifyCardNumber(
																parseInt(fields?.[Ids?.bankCardNumber] ?? ""),
															) ? (
																<AiOutlineCheck
																	className="inline text-green-500"
																	size={15}
																/>
															) : (
																""
															)}
														</span>
														{fields[Ids.bankCardNumber] && (
															<span className="mr-2 max-w-[85%] text-gray-400">
																{getBankNameFromCardNumber(
																	parseInt(fields?.[Ids?.bankCardNumber] ?? ""),
																)
																	? getBankNameFromCardNumber(
																			parseInt(
																				fields?.[Ids?.bankCardNumber] ?? "",
																			),
																		)
																	: "یافت نشد..."}
															</span>
														)}
													</div>
												</AccordionContent>
											</AccordionItem>
										</Accordion>

										<div className="m-2 flex w-[300px] flex-col">
											<Label className="m-1">نام صاحب حساب</Label>
											<input
												disabled={watch()?.InputType === "official"}
												onChange={(event) =>
													setValue(Ids.bankAccountsOwner, event.target.value, {
														shouldValidate: true,
													})
												}
												value={watch().BankAccountsOwner}
												className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
													requieres && !fields[Ids.bankAccountsOwner]
														? "border-red-500"
														: "border-white"
												}`}
												placeholder={"نام صاحب حساب"}
											/>
										</div>
									</>
								)}
							<div className="m-2 flex w-[300px] flex-col">
								<Label className="m-1">
									{watch().InputType === "official"
										? "کد ملی"
										: "کد / شناسه ملی"}
								</Label>
								<input
									disabled={watch()?.InputType === "official"}
									onKeyDown={() => null}
									value={watch().UserInformation?.nationalCode as string}
									className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 ${
										requieres && !fields[Ids.bankAccountsOwner]
											? "border-red-500"
											: "border-white"
									}`}
									onChange={(event) =>
										setValue(
											"UserInformation",
											{
												...fields.UserInformation,
												nationalCode: event.target.value,
											},
											{
												shouldValidate: true,
											},
										)
									}
									placeholder={"کد ملی"}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
