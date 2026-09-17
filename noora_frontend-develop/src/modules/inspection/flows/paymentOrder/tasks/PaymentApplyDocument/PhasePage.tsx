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
import gregorian from "react-date-object/calendars/gregorian";
import persian from "react-date-object/calendars/persian";
import gregorian_fa from "react-date-object/locales/gregorian_fa";
import persian_fa from "react-date-object/locales/persian_fa";
import { useFormContext, UseFormSetValue } from "react-hook-form";
import { AiOutlineCheck } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
import { getCostsByPayment } from "@/financial/costs/services/getCostsByPayment";
import createCustomer from "@/financial/sepidar/customer/service/createCustomer";
import getCustomerCheck from "@/financial/sepidar/customer/service/getCustomer";
import { VoucherItem } from "@/financial/sepidar/vouchers/models/VoucherItem";
import createVoucher from "@/financial/sepidar/vouchers/services/createVoucher";
import { MaskInput } from "@/form/MaskInput";
import { updatePersonnel } from "@/hrm/personnel/services/updatePersonnel";
import { convertPersianNumbersToEnglish } from "@/hrm/schedules/utils/convertPersianNumbersToEnglish";
import { UserApi } from "@/identity/users/models/User";
import { InspectionPaymentStatusBadge } from "@/inspection/components/InspectionPaymentStatusBadge";
import { currencies } from "@/inspection/models/Currencies";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import FindUser from "../../components/FindUser";
import { Ids } from "../../data";
import { PaymentCostsBanks } from "../../data/PaymentCostsBanks";
import { PaymentCostsBanksMoein } from "../../data/PaymentCostsBanksMoein";
import { PaymentPriority } from "../../data/PaymentPriority";
import { PaymentTyps, peymentCodeTypes } from "../../data/PaymentTypes";
import PaymentByParts from "../PaymentCompletion/_components/PaymentByParts";
import { schema } from "../PaymentRequest/PhaseSchema";

type FormData = z.infer<typeof schema>;

interface formAttribuiteProps {
	paymentDate?: string | DateObject | any;
}
interface vounchersProps {
	date?: string;
	headerDescription?: string;
	items?: VoucherItem[];
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
	const {
		task: { instanceId, caseNo },
		hooks,
	} = useTaskContext();

	const { setValue, watch } = useFormContext<FormData>();

	const fields = watch();

	const [formAttribuite, setFormAttribuite] = useState<formAttribuiteProps>();
	const [vounchers, setVounchers] = useState<vounchersProps>();
	const [tableData, setTableData] = useState<Cost[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [isUser, setIsUser] = useState<any>();
	const [bankAccount, setBankAccount] = useState<any>();
	const [bankAccountMoein, setBankAccountMoein] = useState<any>();
	const [bankAccountInput, setBankAccountInput] = useState<any>();
	const [documentDate, setDocumentDate] = useState<any>();
	const [documentItems, setDocuemntItems] = useState<any>();
	const [userCode, setUserCode] = useState<string | null>(null);
	const [userType, setUserType] = useState<string>("");
	const [inputSum, setInputSum] = useState<number>(0);
	const [documentCode, setDocumentCode] = useState<any>();
	const [inputs, setInputs] = useState<any>(
		fields[Ids.paidAmount] ?? [
			{ value: "", rate: "", currency: "", isDocument: false },
		],
	);
	const [rate, setRate] = useState<string>(
		fields[Ids.paidAmount]?.[0]?.rate ?? "1",
	);
	const [currency, setCurrency] = useState<string>(
		fields[Ids.currency] ?? "rial",
	);
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
	const handleAddInput = () => {
		setInputs([
			...inputs,
			{ value: "", rate: "", currency: "", isDocument: false },
		]);
	};
	// const handleCalcualtePirce = () => {
	//   let sum = 0;
	//   inputs.forEach((input: any) => {
	//     sum += Number(input.value);
	//   });
	//   setInputSum(sum);
	//   if (+fields[Ids.amount] - sum >= 0 && sum <= +fields[Ids.amount]) {
	//     setValue("RemainingAmount", (+fields[Ids.amount] - sum).toString());
	//     setValue(
	//       "PaidAmount",
	//       inputs?.filter((x: any) => x?.value !== "" && x)
	//     );
	//     toast.success("مبلغ پرداختی با موفقیت بروزرسانی شد");
	//   } else {
	//     toast.error("مبلغ نهایی اشتباه است!");
	//   }
	// };

	const handleCalcualtePirce = () => {
		let sum = 0;
		inputs.forEach((input: any) => {
			sum += input?.isDocument ? Number(input.value) : 0;
		});
		setInputSum(sum);
		let updatedSum = sum;
		// Initialize updatedItems to store the paid items
		let updatedItems: any = [];

		// Iterate through each item in tableData and distribute the total paid amount
		tableData.forEach((item, i) => {
			const value = item?.total ? parseInt(item?.total) : 0;
			const paidItem = { ...item, paidAmount: 0, status: "unpaid" }; // Create a copy of the item to avoid mutating the original
			if (updatedSum > 0) {
				if (updatedSum === value) {
					paidItem.paidAmount = value;
					updatedSum = 0;
					paidItem.paidAmount === value ? (paidItem.status = "paid") : null;
				} else if (updatedSum > value) {
					// If the total paid amount is greater than or equal to the item value
					paidItem.paidAmount = value;
					updatedSum -= value;
					paidItem.paidAmount === value ? (paidItem.status = "paid") : null;
				} else if (updatedSum < value) {
					// If the total paid amount is greater than 0 but less than the item value
					// Pay half of the remaining amount for this item
					paidItem.paidAmount = updatedSum;
					updatedSum = 0;
					paidItem.paidAmount === value ? (paidItem.status = "paid") : null;
				} else {
					console.log("error");
				}
			}
			updatedItems.push(paidItem); // Add the paid item to updatedItems
		});

		setDocuemntItems(updatedItems);
		// Update the remaining amount and paid amount in the form
		if (+fields[Ids.amount] - sum >= 0 && inputSum <= +fields[Ids.amount]) {
			setValue("RemainingAmount", (+fields[Ids.amount] - sum).toString());
			setValue(
				"PaidAmount",
				inputs?.filter((item: any) => (item?.value?.length > 0 ? item : null)),
			); // Use updatedItems instead of filtering
			toast.success("مبلغ پرداختی با موفقیت بروزرسانی شد");
		} else {
			toast.error("مبلغ نهایی اشتباه است!");
		}
	};

	useEffect(() => {
		handleCalcualtePirce();
	}, []);
	async function handleCheckSepidar() {
		setLoading(true);
		try {
			let res: any = await getCustomerCheck({
				nationalCode: fields[Ids.userInformation]?.nationalCode,
			});
			if (res) {
				if (res?.DlCode === false) {
					setIsUser({ isExist: false });
					toast.error("کاربر مورد نظر یافت نشد");
				} else {
					setUserCode(res?.DlCode);
					setIsUser({ isExist: true });
					toast.success("کاربر مورد نظر در سامانه وجود دارد.");
				}
				setLoading(false);
			}
		} catch {
			setLoading(false);
		}
	}
	console.log(fields);

	async function handleCreateSepidarUser() {
		setLoading(true);
		try {
			let res: any = await createCustomer({
				nationalCode: fields[Ids.userInformation]?.nationalCode ?? "-",
				address: "-",
				contactNo: fields[Ids.userInformation]?.phoneNo ?? "-",
				code: userCode?.length ? userCode : null,
				isCustomer:
					fields[Ids.userInformation]?.type === "personnel" ? true : false,
				name: `${fields[Ids.userInformation]?.name} ${
					fields[Ids.userInformation]?.lastname
				}`,
				postalCode: "-",
				type: userType ?? "natural",
			});
			if (res) {
				setUserCode(res?.result?.DlCode);
				setIsUser({ isExist: true });
				const personnel = await updatePersonnel(
					fields[Ids.userInformation]?.id,
					{
						sepidarId: res?.result?.DlCode,
					},
				);
				if (personnel) {
					setLoading(false);
					toast.success("کاربر با موفقیت ایجاد شد");
				}
			}
		} catch {
			setLoading(false);
		}
	}

	async function handleCreateDocument() {
		// setLoading(true);
		let items: VoucherItem[] = [];
		let totalAm = 0;
		const caseNumbers = documentItems
			.map((obj: any) => (obj.paidAmount > 0 ? obj.caseNo : null))
			.join(", ");
		try {
			for (let i = 0; i < inputs.length; i++) {
				inputs[i]?.isDocument
					? items.push({
							credit: 0,
							debit: +inputs[i].value,
							description: `پ ${i + 1} د ${caseNo} - ف ${caseNumbers}`,
							dlCode: userCode as string, //documentItems[i].sepidarId,
							slCode: "610011",
						})
					: null;
				inputs[i]?.isDocument ? (totalAm += +inputs[i].value) : null;
			}
			items.push({
				credit: totalAm,
				debit: 0,
				description: `${fields[Ids.description]} - ف ${caseNumbers}`,
				dlCode: bankAccount !== "other" ? bankAccount : bankAccountInput, //documentItems[i].sepidarId,
				slCode: bankAccountMoein,
			});

			setVounchers({
				date: convertPersianNumbersToEnglish(
					new DateObject({ date: documentDate, format: "YYYY-MM-DD" })
						.convert(gregorian, gregorian_fa)
						.format(),
				),
				headerDescription: `${fields[Ids.description]} - ف ${caseNumbers}`,
				items: items,
			});
			if (items?.length > 1) {
				let res = await createVoucher({
					date: convertPersianNumbersToEnglish(
						new DateObject({ date: documentDate, format: "YYYY-MM-DD" })
							.convert(gregorian, gregorian_fa)
							.format(),
					),
					items: items,
					description: `${fields[Ids.description]} - ف ${caseNumbers}`,
				});
				if (res) {
					toast.success(`فاکتور با موفقیت ایجاد شد - کد: ${res}`);
					setDocumentCode(res);
					setLoading(false);
				}
			} else {
				toast.error("حداقل یک مورد را انتخاب نمایید.");
			}
		} catch (e) {
			toast.error("خطا در ایجاد فاکتور");
			console.log(e);
			setLoading(false);
		}
	}

	useEffect(() => {
		getCostsTableList();
	}, []);
	useEffect(() => {
		if (formAttribuite?.paymentDate) {
			setValue(Ids.paymentDate, formAttribuite.paymentDate);
		} else {
			setFormAttribuite({
				paymentDate: watch().PaymentDate,
			});
		}
	}, [formAttribuite]);

	useEffect(() => {
		if (!inputs?.length) {
			setValue("RemainingAmount", fields[Ids.amount]);
			setValue("PaidAmount", []);
		}
	}, [inputs]);

	useEffect(() => {
		hooks.registerHook("submit", ({ task, data }) => {
			setStageOfInstance(task.instanceId, "paymentOrder-paid");
			if (data?.RemainingAmount === 0) {
				console.log("true");
			}
		});
	});

	useEffect(() => {
		!watch()?.ExpertState && setValue("ExpertState", "nextStep");
	}, []);

	return (
		<>
			<Badge className="my-2 w-fit min-w-[14rem] whitespace-nowrap rounded-xl px-[1rem] py-[1rem]">
				درخواست دهنده: {watch().UserData}
			</Badge>
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
						<Label className="m-1">توضیحات شما</Label>
						<textarea
							onChange={(event) =>
								setValue(Ids.payDes, event.target.value, {
									shouldValidate: true,
								})
							}
							value={watch().PayDes}
							className={`group relative h-[10rem] resize-none text-ellipsis rounded-[.5rem] border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[1rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"توضیحات شما..."}
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
						<CashPay
							cashPay={fields[Ids.cashPay] === "true"}
							setValue={setValue}
						/>
						{fields[Ids.currency] === "rial" &&
							(fields[Ids.cashPay] === "false" || !fields[Ids.cashPay]) && (
								<>
									<Accordion type="single" collapsible>
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
								disabled={watch()?.InputType === "official"}
								onKeyDown={() => null}
								value={watch().UserInformation?.nationalCode as string}
								className={`group relative my-2 w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"کد ملی"}
							/>
						</div>
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
				</div>

				{fields[Ids.processType] === "beneficiary" && tableData && (
					<div className="w-full">
						<Seperator className="bg-white" />
						<Accordion type="single" collapsible className="w-full px-2">
							<AccordionItem value="item-1" className="w-full border-none">
								<AccordionTrigger>لیست ذینفعان</AccordionTrigger>
								<AccordionContent>
									<Table className="my-2 w-full">
										<TableHeader className="bg-gray-300">
											<TableRow className="select-none bg-gray-200 text-right">
												<TableHead className="px-2 text-right">ردیف</TableHead>
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
													نرخ تسعیر{" "}
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{!!tableData?.length &&
												tableData.map((item, i: number) => (
													<TableRow key={i}>
														<TableCell>{i + 1}</TableCell>
														<TableCell>{item.caseNo ?? "-"}</TableCell>
														<TableCell>
															{item.instance?.buyer?.name ?? "-"}
														</TableCell>
														<TableCell>{item.instance?.name ?? "-"}</TableCell>
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
																	status={item.instance.invoicePaymentStatus}
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

				<div className="w-full">
					<Seperator className="bg-white" />
					<Accordion
						type="single"
						collapsible
						defaultValue="item-1"
						className="w-full px-2"
					>
						<AccordionItem value="item-1">
							<AccordionTrigger>پرداخت</AccordionTrigger>
							<AccordionContent>
								<div className="relative flex flex-col">
									<label className="mx-[1.5rem] mb-[1rem] flex select-none items-center">
										<Button
											disabled
											type="button"
											className="bg-blue-500 hover:bg-blue-600"
											// onClick={handleAddInput}
										>
											<FaPlus size={16} className="mx-1" />
											افزودن
										</Button>
									</label>

									<PaymentByParts
										rate={rate}
										currency={currency}
										onlyPrice
										setInputs={(value) => {
											setInputs(value);
										}}
										inputs={inputs}
										disabled
									/>
								</div>

								{inputs?.length ? (
									<div className="flex w-full flex-col">
										<div className="flex flex-col">
											<p className="my-1">
												باقی مانده:
												<Badge
													className={`mx-1`}
													variant={`${
														+fields[Ids.remainingAmount] < 0
															? "destructive"
															: "default"
													}`}
												>
													{addCommas(fields[Ids.remainingAmount])}{" "}
													{fields[Ids.currency] === "dollar"
														? "دلار"
														: fields[Ids.currency] === "euro"
															? "یورو"
															: fields[Ids.currency] === "rial"
																? "ریال"
																: "یوان"}
												</Badge>
											</p>
											<p className="my-1">
												مجموع وارد شده:
												<Badge
													className={`mx-1`}
													variant={`${
														inputSum > +fields[Ids.amount]
															? "destructive"
															: "default"
													}`}
												>
													{addCommas(inputSum)}
													{fields[Ids.currency] === "dollar"
														? "دلار"
														: fields[Ids.currency] === "euro"
															? "یورو"
															: fields[Ids.currency] === "rial"
																? "ریال"
																: "یوان"}
												</Badge>
											</p>
										</div>
										<Button
											disabled={
												JSON.stringify(fields[Ids.paidAmount]) ===
												JSON.stringify(inputs)
											}
											type="button"
											onClick={handleCalcualtePirce}
											className="mt-5 w-16 self-end bg-blue-500 hover:bg-blue-600"
										>
											ثبت
										</Button>

										<Seperator className="mt-4 bg-white" />

										<div className="my-2 flex items-center">
											<input
												disabled={watch()?.InputType === "official"}
												onKeyDown={() => null}
												value={watch().UserInformation?.nationalCode as string}
												className={`group relative ml-4 w-full max-w-[300px] text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
											<Button
												// disabled={
												//   JSON.stringify(fields[Ids.paidAmount]) ===
												//   JSON.stringify(inputs)
												// }
												disabled={loading}
												type="button"
												onClick={handleCheckSepidar}
												className="self-end bg-blue-500 hover:bg-blue-600"
											>
												{loading ? <Loading /> : "بررسی کاربر در سپیدار"}
											</Button>
											{userCode ? (
												<Badge className="mx-2 p-2">{userCode}</Badge>
											) : (
												""
											)}
										</div>
										{isUser?.isExist === false ? (
											<div className="mt-2 flex items-center">
												<Select
													onValueChange={(value) => setUserType(value)}
													value={userType}
												>
													<SelectTrigger
														className={`group relative ml-1 max-w-[300px] text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
													>
														<SelectValue placeholder="انتخاب" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value={"natural"}>
															<span className="px-2">حقیقی</span>
														</SelectItem>
														<SelectItem value={"legal"}>
															<span className="px-2">حقوقی</span>
														</SelectItem>
													</SelectContent>
												</Select>
												<Input
													value={userCode || ""}
													onChange={(e) => setUserCode(e.target.value)}
													placeholder="کد(اختیاری)"
													className="max-w-[300px] rounded-2xl"
												/>
												<Button
													// disabled={
													//   JSON.stringify(fields[Ids.paidAmount]) ===
													//   JSON.stringify(inputs)
													// }
													disabled={loading}
													type="button"
													onClick={handleCreateSepidarUser}
													className="mx-2 self-end bg-blue-500 hover:bg-blue-600"
												>
													{loading ? <Loading /> : "ثبت کاربر در سپیدار"}
												</Button>
											</div>
										) : isUser?.isExist === true ? (
											<div className="mt-6 flex flex-col">
												<div className="flex">
													<div className="flex min-w-[400px] items-center">
														<Label className="w-fit px-1">کد معین</Label>
														<Select
															onValueChange={(value) =>
																setBankAccountMoein(value)
															}
															value={bankAccountMoein}
														>
															<SelectTrigger
																className={`group relative ml-1 max-w-[300px] text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
															>
																<SelectValue placeholder="انتخاب" />
															</SelectTrigger>
															<SelectContent>
																{peymentCodeTypes.map((type, index: number) => (
																	<SelectItem
																		value={type.value}
																		key={type.value}
																	>
																		<span className="px-2">{type.label}</span>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
													<div className="flex min-w-[500px] items-center">
														<Label className="w-fit min-w-[4rem] px-1">
															کد تفصیل
														</Label>
														<Select
															onValueChange={(value) => setBankAccount(value)}
															value={bankAccount}
														>
															<SelectTrigger
																className={`group relative ml-1 max-w-[300px] text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
															>
																<SelectValue placeholder="انتخاب" />
															</SelectTrigger>
															<SelectContent>
																{PaymentCostsBanks.map(
																	(priority, index: number) => (
																		<SelectItem
																			value={priority.value}
																			key={priority.value}
																		>
																			<span className="px-2">
																				{priority.label}
																			</span>
																		</SelectItem>
																	),
																)}
															</SelectContent>
														</Select>
														{bankAccount === "other" ? (
															<Input
																value={bankAccountInput}
																onChange={(e) =>
																	setBankAccountInput(e.target.value)
																}
																placeholder="کد"
																className="max-w-[300px] rounded-2xl"
															/>
														) : (
															""
														)}
													</div>
												</div>
												<div>
													<Label className="w-fit min-w-[4rem] px-1">
														تاریخ
													</Label>
													<DatePicker
														containerClassName="max-w-[300px] mt-4"
														calendar={persian}
														locale={persian_fa}
														inputClass={`w-full text-[.9rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
														placeholder="تاریخ پرداخت"
														calendarPosition="bottom"
														onFocusedDateChange={(dateFocused, dateClicked) =>
															dateClicked ? setDocumentDate(dateClicked) : ""
														}
														value={documentDate}
													/>
												</div>
												<Button
													// disabled={
													//   JSON.stringify(fields[Ids.paidAmount]) ===
													//   JSON.stringify(inputs)
													// }
													disabled={
														loading ||
														!bankAccount ||
														(bankAccount === "other" && !bankAccountInput) ||
														!bankAccountMoein ||
														!documentDate
													}
													type="button"
													onClick={handleCreateDocument}
													className="mx-2 self-end bg-blue-500 hover:bg-blue-600"
												>
													{loading ? <Loading /> : "ثبت سند در سپیدار"}
												</Button>
											</div>
										) : (
											""
										)}
									</div>
								) : (
									""
								)}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</div>
		</>
	);
}
