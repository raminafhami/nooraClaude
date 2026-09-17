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
import { z } from "zod";

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
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { MaskInput } from "@/form/MaskInput";
import { UserApi } from "@/identity/users/models/User";
import { currencies } from "@/inspection/models/Currencies";

import FindUser from "../../components/FindUser";
import { Ids } from "../../data";
import { PaymentPriority } from "../../data/PaymentPriority";
import { PaymentTyps } from "../../data/PaymentTypes";
import { schema } from "../PaymentRequest/PhaseSchema";

type FormData = z.infer<typeof schema>;

interface formAttribuiteProps {
	paymentDate?: string | DateObject | any;
}

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
	const { setValue, watch } = useFormContext<FormData>();

	const fields = watch();
	const {
		task: { instanceId },
		hooks,
	} = useTaskContext();

	const [formAttribuite, setFormAttribuite] = useState<formAttribuiteProps>();
	const [inputSum, setInputSum] = useState<number>(0);
	const [inputs, setInputs] = useState<any>(
		fields[Ids.paidAmount] ?? [
			{ value: "", rate: "", currency: "", isDocument: false },
		],
	);
	const [userData, setUserData] = useState<UserApi | undefined>(
		fields[Ids.userInformation],
	);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (formAttribuite?.paymentDate) {
			setValue(Ids.paymentDate, formAttribuite.paymentDate);
		} else {
			setFormAttribuite({
				paymentDate: watch().PaymentDate,
			});
		}
	}, [formAttribuite]);

	return (
		<>
			<h1 className="my-2 w-fit min-w-[14rem] whitespace-nowrap rounded-xl bg-gray-50 px-[1rem] py-[1rem]">
				درخواست دهنده: {watch().UserData}
			</h1>
			<div className="col-span-9 col-start-1 flex flex-col items-center justify-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1">
				<div className="flex w-full flex-wrap p-2">
					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">توضیحات درخواست دهنده</Label>
						<textarea
							disabled
							onChange={(event) =>
								setValue(Ids.description, event.target.value, {
									shouldValidate: true,
								})
							}
							value={fields[Ids.description]}
							className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] text-gray-400 placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"توضیحات ..."}
						/>
					</div>

					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">توضیحات مدیر</Label>
						<textarea
							disabled
							value={watch().ReviewDes ?? "-"}
							className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] text-gray-400 placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"توضیحات مدیر..."}
						/>
					</div>

					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">توضیحات مالی</Label>
						<textarea
							disabled
							value={watch().PayDes}
							className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"توضیحات مالی..."}
						/>
					</div>

					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">واحد پول</Label>
						<Select
							disabled
							// onValueChange={(value) => setValue("Currency", value)}
							value={fields[Ids.currency]}
						>
							<SelectTrigger
								className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
							disabled
							dir="ltr"
							value={
								fields[Ids.amount]
									? addCommas(fields[Ids.amount]?.toLocaleString())
									: watch().Amount
							}
							className={`group relative w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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

					<div className="relative m-2 flex w-[300px] flex-col">
						<div className="mb-4 flex items-center justify-center rounded-2xl border py-2">
							<Label className="mx-2">پرسنل</Label>
							<Switch
								defaultChecked={
									watch()?.InputType === "official" ? false : true
								}
								disabled
							/>
							<Label className="mx-2">سایر</Label>
						</div>
						<CashPay
							cashPay={fields[Ids.cashPay] === "true"}
							setValue={setValue}
						/>
						{fields[Ids.processType] !== "beneficiary" &&
							watch()?.InputType === "official" && (
								<FindUser
									disabled
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
												className={`btn flex items-center rounded-2xl bg-blue-500 px-4 py-2 text-white`}
											>
												<PiNumberCircleOneBold className="ml-2" size={15} />
												پرداخت به شماره شبا
											</AccordionTrigger>
											<AccordionContent>
												<div className="relative my-2">
													<MaskInput
														readOnly
														dir="ltr"
														disabled={watch()?.InputType === "official"}
														mask={"IR 00 0000 0000 0000 0000 0000 00"}
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
														className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
												className={`btn my-2 flex items-center rounded-2xl bg-blue-500 px-4 py-2 text-white`}
											>
												<PiNumberCircleTwoBold className="ml-2" size={15} />
												پرداخت به شماره کارت
											</AccordionTrigger>
											<AccordionContent>
												<div className="relative my-2 mb-6">
													<MaskInput
														readOnly
														dir="ltr"
														disabled={watch()?.InputType === "official"}
														mask={"0000 0000 0000 0000"}
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
														className={`group relative mb-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
											readOnly
											value={watch().BankAccountsOwner}
											className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
											placeholder={"نام صاحب حساب"}
										/>
									</div>
								</>
							)}
						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">
								{watch().InputType === "official" ? "کد ملی" : "کد / شناسه ملی"}
							</Label>
							<input
								readOnly
								onKeyDown={() => null}
								value={watch().UserInformation?.nationalCode as string}
								className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"کد ملی"}
							/>
						</div>
						{watch()?.InputType === "official" && (
							<div className="m-2 flex w-[300px] flex-col">
								<Label className="m-1">کد ملی</Label>
								<input
									readOnly
									onKeyDown={() => null}
									value={watch().UserInformation?.nationalCode as string}
									className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
									placeholder={"کد ملی"}
								/>
							</div>
						)}
					</div>

					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">عنوان</Label>
						<input
							disabled
							onChange={(event) =>
								setValue(Ids.title, event.target.value, {
									shouldValidate: true,
								})
							}
							value={fields[Ids.title]}
							className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] text-gray-400 placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"عنوان"}
						/>
					</div>

					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">تاریخ پرداخت</Label>
						<DatePicker
							calendar={persian}
							locale={persian_fa}
							inputClass={`w-full text-[.9rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
							placeholder="تاریخ پرداخت"
							calendarPosition="bottom"
							disabled
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
						<Select disabled value={fields[Ids.priority]}>
							<SelectTrigger
								className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
							onValueChange={(value) =>
								setValue(Ids.processType, value, {
									shouldValidate: true,
								})
							}
							disabled
							value={fields[Ids.processType]}
						>
							<SelectTrigger
								className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							>
								<SelectValue placeholder="انتخاب" />
							</SelectTrigger>
							<SelectContent>
								{PaymentTyps.map((type, index: number) => (
									<SelectItem value={type.value} key={index}>
										<span className="px-2">{type.label}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		</>
	);
}
