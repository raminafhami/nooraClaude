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
import { useContext, useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useFormContext, UseFormSetValue } from "react-hook-form";
import { AiOutlineCheck } from "react-icons/ai";
import { PiNumberCircleOneBold, PiNumberCircleTwoBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Cost } from "@/financial/costs/models/Cost";
import { cancelCostsPayment } from "@/financial/costs/services/cancelCostsPayment";
import { getCostsByPayment } from "@/financial/costs/services/getCostsByPayment";
import { MaskInput } from "@/form/MaskInput";
import { UserApi } from "@/identity/users/models/User";
import { InspectionPaymentStatusBadge } from "@/inspection/components/InspectionPaymentStatusBadge";
import { currencies } from "@/inspection/models/Currencies";
import { Seperator } from "@/ui/Seperator";

import FindUser from "../../components/FindUser";
import { Ids } from "../../data";
import { PaymentPriority } from "../../data/PaymentPriority";
import { PaymentStates } from "../../data/PaymentStates";
import { PaymentTyps } from "../../data/PaymentTypes";
import { schema } from "../PaymentRequest/PhaseSchema";

type FormData = z.infer<typeof schema>;

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
					disabled
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
	const [tableData, setTableData] = useState<Cost[]>([]);

	const fields = watch();

	const {
		task: { data, instanceId },
		hooks,
	} = useTaskContext();

	interface formAttribuiteProps {
		paymentDate?: string | DateObject;
	}

	const [formAttribuite, setFormAttribuite] = useState<formAttribuiteProps>();
	const [userData, setUserData] = useState<UserApi | undefined>(
		fields[Ids.userInformation],
	);
	const [open, setOpen] = useState(false);

	async function getCostsTableList() {
		try {
			let res = await getCostsByPayment(instanceId, {
				populate: ["instance", "personId"],
			});
			if (res) {
				setTableData(res);
			}
		} catch {
			toast.error("خطا در برقراری ارتباط با سرور");
		}
	}

	useEffect(() => {
		getCostsTableList();
	}, []);

	useEffect(() => {
		if (formAttribuite?.paymentDate) {
			setValue(Ids.paymentDate, formAttribuite.paymentDate.toString());
		} else {
			setFormAttribuite({
				paymentDate: watch().PaymentDate,
			});
		}
	}, [formAttribuite]);

	useEffect(() => {
		hooks.registerHook("submit", async ({ task, data }) => {
			if (data?.IsCancel === "true") {
				let update = await cancelCostsPayment({
					instanceId: instanceId,
				});
				setStageOfInstance(task.instanceId, "paymentOrder-cancel");
			} else {
				if (fields[Ids.state] === "accept") {
					setStageOfInstance(task.instanceId, "paymentOrder-pay");
				} else {
					setStageOfInstance(task.instanceId, "paymentOrder-request");
				}
			}
		});
		if (!fields[Ids.state]) {
			setValue(Ids.state, "accept");
		}
	});

	return (
		<>
			<Badge className="w-fit min-w-[14rem] whitespace-nowrap rounded-xl px-[1rem] py-[1rem]">
				درخواست دهنده: {watch().UserData}
			</Badge>
			<div className="my-2 flex w-fit items-center rounded-xl bg-gray-100 p-2">
				<Checkbox
					className="mx-1"
					defaultChecked={fields[Ids.isCancel] === "true"}
					onCheckedChange={(e) =>
						setValue("IsCancel", e === true ? "true" : "false")
					}
				></Checkbox>
				<Label className="mx-1">لغو درخواست</Label>
			</div>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<div className="col-span-9 col-start-1 flex items-center justify-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1">
					<div className="flex w-full flex-wrap p-2">
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
									className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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

						<div className="m-2 flex w-[300px] flex-col">
							<Label className="m-1">توضیحات شما</Label>
							<textarea
								onChange={(event) =>
									setValue(Ids.reviewDes, event.target.value, {
										shouldValidate: true,
									})
								}
								value={watch().ReviewDes}
								className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"توضیحات شما..."}
							/>
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
															dir="ltr"
															disabled={watch()?.InputType === "official"}
															mask={"IR 00 0000 0000 0000 0000 0000 00"}
															// onMutate={(v) => setValue(Ids.bankSheba, v)}
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
												onChange={(event) =>
													setValue(Ids.bankAccountsOwner, event.target.value, {
														shouldValidate: true,
													})
												}
												value={watch().BankAccountsOwner}
												className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"نام صاحب حساب"}
											/>
										</div>
									</>
								)}

							{watch()?.InputType === "official" && (
								<div className="m-2 flex w-[300px] flex-col">
									<Label className="m-1">کد ملی</Label>
									<input
										disabled={watch()?.InputType === "official"}
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
							<Label className="m-1">وضعیت</Label>
							<Select
								onValueChange={(value) =>
									setValue(Ids.state, value, {
										shouldValidate: true,
									})
								}
								value={`${fields[Ids.state] ? fields[Ids.state] : "accept"}`}
							>
								<SelectTrigger
									className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								>
									<SelectValue placeholder="انتخاب" />
								</SelectTrigger>
								<SelectContent>
									{PaymentStates.map((state, index) => (
										<SelectItem
											key={index}
											value={state.value}
											className={`${
												state.value === "accept"
													? "bg-green-100 text-green-800"
													: "bg-red-100 text-red-800"
											}`}
										>
											<span className="px-2"> {state.label}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{fields[Ids.processType] === "beneficiary" && tableData && (
							<div className="w-full">
								<Seperator className="bg-white" />
								<Accordion
									defaultValue="item-1"
									type="single"
									collapsible
									className="w-full px-2"
								>
									<AccordionItem value="item-1" className="w-full border-none">
										<AccordionTrigger>لیست ذینفعان</AccordionTrigger>
										<AccordionContent>
											<Table className="my-2 w-full">
												<TableHeader className="bg-gray-300">
													<TableRow className="select-none bg-gray-200 text-right">
														<TableHead className="px-2 text-right">
															ردیف
														</TableHead>
														<TableHead className="px-2 text-right">
															شماره درخواست
														</TableHead>
														<TableHead className="px-2 text-right">
															خریدار
														</TableHead>
														<TableHead className="px-2 text-right">
															نوع بازرسی
														</TableHead>
														<TableHead className="px-2 text-right">
															مبلغ بازرسی
														</TableHead>
														<TableHead className="px-2 text-right">
															نام ذینفع
														</TableHead>
														<TableHead className="px-2 text-right">
															نوع کاربری
														</TableHead>
														<TableHead className="px-2 text-right">
															قابل پرداخت
														</TableHead>
														<TableHead className="px-2 text-right">
															وضعیت درخواست
														</TableHead>
														<TableHead className="px-2 text-right">
															وضعیت پرداخت
														</TableHead>
														<TableHead className="px-2 text-right">
															نرخ پیشنهادی{" "}
														</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{tableData?.length &&
														tableData.map((item, i: number) => (
															<TableRow key={i}>
																<TableCell>{i + 1}</TableCell>
																<TableCell>{item.caseNo ?? "-"}</TableCell>
																<TableCell>
																	{item.instance?.buyer?.name ?? "-"}
																</TableCell>
																<TableCell>
																	{item.instance?.name ?? "-"}
																</TableCell>
																<TableCell>
																	{(item.instance?.inspectionFee &&
																		addCommas(item.instance?.inspectionFee)) ??
																		"-"}
																</TableCell>
																<TableCell>{item.personName ?? "-"}</TableCell>
																<TableCell>{item.title || "-"}</TableCell>
																<TableCell>
																	{item.total || item.amount
																		? (item.currency === "rial"
																				? item.total?.replace(
																						/\B(?=(\d{3})+(?!\d))/g,
																						",",
																					)
																				: item.amount?.replace(
																						/\B(?=(\d{3})+(?!\d))/g,
																						",",
																					)) +
																			`${
																				item.currency === "dollar"
																					? " دلار"
																					: item.currency === "euro"
																						? " یورو"
																						: item.currency === "rial"
																							? " ریال"
																							: " یوان"
																			}`
																		: "-"}
																</TableCell>
																<TableCell>
																	{item.instance?.status ? (
																		<InstanceStatusBadge
																			instance={{
																				status: item.instance
																					.status as InstanceStatus,
																			}}
																		/>
																	) : (
																		"-"
																	)}
																</TableCell>
																<TableCell>
																	{item.instance?.invoicePaymentStatus ? (
																		<InspectionPaymentStatusBadge
																			status={
																				item.instance.invoicePaymentStatus
																			}
																		/>
																	) : (
																		"-"
																	)}
																</TableCell>
																<TableCell>
																	{item.currencyRate
																		? `${item.currencyRate?.toLocaleString()} ریال`
																		: "-"}
																</TableCell>
															</TableRow>
														))}
												</TableBody>
											</Table>
										</AccordionContent>
									</AccordionItem>
								</Accordion>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
