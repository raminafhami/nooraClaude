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
import { FaPlus } from "react-icons/fa";
import { PiNumberCircleOneBold, PiNumberCircleTwoBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";
import { z } from "zod";

import updateInspectionCostsMany from "@/api/payment-order/updateInspectionCostsMany";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getCostsByPayment } from "@/financial/costs/services/getCostsByPayment";
import { updateCostsPaymentVouchers } from "@/financial/costs/services/updateCostsPaymentVouchers";
import { MaskInput } from "@/form/MaskInput";
import { UserApi } from "@/identity/users/models/User";
import { InspectionPaymentStatusBadge } from "@/inspection/components/InspectionPaymentStatusBadge";
import { currencies } from "@/inspection/models/Currencies";
import { Seperator } from "@/ui/Seperator";

import FindUser from "../../components/FindUser";
import { Ids } from "../../data";
import { ExpertStates } from "../../data/ExpertStates";
import { PaymentPriority } from "../../data/PaymentPriority";
import { PaymentTyps } from "../../data/PaymentTypes";
import { schema } from "../PaymentRequest/PhaseSchema";
import PaymentByParts from "./_components/PaymentByParts";

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

	const fields = watch();
	const {
		task: { instanceId },
		hooks,
	} = useTaskContext();

	const [formAttribuite, setFormAttribuite] = useState<formAttribuiteProps>();
	const [tableData, setTableData] = useState<Cost[]>([]);
	const [inputSum, setInputSum] = useState<number>(0);
	const [rate, setRate] = useState<string>(
		fields[Ids.paidAmount]?.[0]?.rate ?? "1",
	);
	const [currency, setCurrency] = useState<string>(
		fields[Ids.currency] || "rial",
	);
	const [inputs, setInputs] = useState<
		{
			value: string;
			rate: string;
			currency: string;
			isDocument: boolean;
		}[]
	>(
		fields[Ids.paidAmount] ?? [
			{ value: "", rate: rate, currency: currency, isDocument: true },
		],
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
			{ value: "", rate: rate, currency: currency, isDocument: true },
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

		// setDocuemntItems(updatedItems);
		// Update the remaining amount and paid amount in the form
		if (+fields[Ids.amount] - sum >= 0 && inputSum <= +fields[Ids.amount]) {
			setValue("RemainingAmount", (+fields[Ids.amount] - sum).toString());
			setValue(
				"PaidAmount",
				inputs?.filter((item: any) => (item?.value?.length > 0 ? item : null)),
			); // Use updatedItems instead of filtering
			toast.success("مبلغ پرداختی با موفقیت بروزرسانی شد");
			return true;
		} else {
			toast.error("مبلغ نهایی اشتباه است!");
			return false;
		}
	};

	useEffect(() => {
		handleCalcualtePirce();
	}, []);
	// async function handleCheckSepidar() {
	//   setLoading(true);
	//   try {
	//     let res: any = await getCustomerCheck({
	//       nationalCode: fields[Ids.userInformation]?.nationalCode,
	//     });
	//     if (res) {
	//       if (res?.DlCode === false) {
	//         setIsUser({ isExist: false });
	//         toast.error("کاربر مورد نظر یافت نشد");
	//       } else {
	//         setUserCode(res?.DlCode);
	//         setIsUser({ isExist: true });
	//         toast.success("کاربر مورد نظر در سامانه وجود دارد.");
	//       }
	//       setLoading(false);
	//     }
	//   } catch {
	//     setLoading(false);
	//   }
	// }

	// async function handleCreateSepidarUser() {
	//   setLoading(true);
	//   try {
	//     let res: any = await createCustomer({
	//       nationalCode: fields[Ids.userInformation]?.nationalCode ?? "-",
	//       address: "-",
	//       contactNo: fields[Ids.userInformation]?.phoneNo ?? "-",
	//       code: userCode?.length ? userCode : null,
	//       isCustomer:
	//         fields[Ids.userInformation]?.type === "personnel" ? true : false,
	//       name: `${fields[Ids.userInformation]?.name} ${
	//         fields[Ids.userInformation]?.lastname
	//       }`,
	//       postalCode: "-",
	//       type: userType ?? "natural",
	//     });
	//     if (res) {
	//       setUserCode(res?.result?.DlCode);
	//       setIsUser({ isExist: true });
	//       const personnel = await updatePersonnel(
	//         fields[Ids.userInformation]?.id,
	//         {
	//           sepidarId: res?.result?.DlCode,
	//         }
	//       );
	//       if (personnel) {
	//         setLoading(false);
	//         toast.success("کاربر با موفقیت ایجاد شد");
	//       }
	//     }
	//   } catch {
	//     setLoading(false);
	//   }
	// }

	// async function handleCreateDocument() {
	//   // setLoading(true);
	//   let items: VoucherItem[] = [];
	//   let totalAm = 0;
	//   const caseNumbers = documentItems
	//     .map((obj: any) => (obj.paidAmount > 0 ? obj.caseNo : null))
	//     .join(", ");
	//   try {
	//     for (let i = 0; i < inputs.length; i++) {
	//       inputs[i]?.isDocument
	//         ? items.push({
	//             credit: 0,
	//             debit: +inputs[i].value,
	//             description: `پ ${i + 1} د ${caseNo} - ف ${caseNumbers}`,
	//             dlCode: userCode as string, //documentItems[i].sepidarId,
	//             slCode: "610011",
	//           })
	//         : null;
	//       inputs[i]?.isDocument ? (totalAm += +inputs[i].value) : null;
	//     }
	//     items.push({
	//       credit: totalAm,
	//       debit: 0,
	//       description: `${fields[Ids.description]} - ف ${caseNumbers}`,
	//       dlCode: bankAccount !== "other" ? bankAccount : bankAccountInput, //documentItems[i].sepidarId,
	//       slCode: bankAccountMoein,
	//     });

	//     setVounchers({
	//       date: convertPersianNumbersToEnglish(
	//         new DateObject({ date: documentDate, format: "YYYY-MM-DD" })
	//           .convert(gregorian, gregorian_fa)
	//           .format()
	//       ),
	//       headerDescription: `${fields[Ids.description]} - ف ${caseNumbers}`,
	//       items: items,
	//     });
	//     if (items?.length > 1) {
	//       let res = await createVoucher({
	//         date: convertPersianNumbersToEnglish(
	//           new DateObject({ date: documentDate, format: "YYYY-MM-DD" })
	//             .convert(gregorian, gregorian_fa)
	//             .format()
	//         ),
	//         items: items,
	//         description: `${fields[Ids.description]} - ف ${caseNumbers}`,
	//       });
	//       if (res) {
	//         toast.success(`فاکتور با موفقیت ایجاد شد - کد: ${res}`);
	//         setDocumentCode(res);
	//         setLoading(false);
	//       }
	//     } else {
	//       toast.error("حداقل یک مورد را انتخاب نمایید.");
	//     }
	//   } catch (e) {
	//     toast.error("خطا در ایجاد فاکتور");
	//     console.log(e);
	//     setLoading(false);
	//   }
	// }

	function convertPersianToArabicDigits(str: string) {
		return str.replace(/[۰-۹]/g, function (digit) {
			return String.fromCharCode(digit.charCodeAt(0) - 1728);
		});
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
			if (data?.RemainingAmount === 0 && data?.ExpertState === "nextStep") {
				setStageOfInstance(task.instanceId, "paymentOrder-paid");
			}
		});
	});

	useEffect(() => {
		!watch()?.ExpertState && setValue("ExpertState", "nextStep");
	}, []);

	useEffect(() => {
		hooks.removeAll();

		hooks.registerHook("pre-submit", async ({ data, task }) => {
			if (
				(data?.PaidAmount?.length === 0 || !data?.PaidAmount) &&
				data?.ExpertState === "nextStep" &&
				!handleCalcualtePirce()
			) {
				throw new Error("حداقل یک مورد پرداختی را انتخاب نمایید.");
			}

			if (
				+data?.RemainingAmount === 0 &&
				data?.ExpertState === "nextStep" &&
				data[Ids.processType] === "beneficiary"
			) {
				const persianDateString = data[Ids.paymentDate];
				const arabicDateStr = convertPersianToArabicDigits(persianDateString);
				const formattedDate = moment(arabicDateStr, "jYYYY/jMM/jDD").format(
					"YYYY-MM-DD",
				);
				try {
					let arr: any = [];
					tableData?.map((i) => {
						arr.push({
							id: i?.id,
							vouchers: [{ voucherNo: 0, date: formattedDate }],
						});
					});

					let res = await updateCostsPaymentVouchers(arr);
					if (res) {
						toast.success("فاکتور های مورد انتخاب شده با موفقیت ثبت شدند.");
					}
				} catch (err) {
					console.error(err);
					toast.error("خطا در ثبت فاکتور های مورد انتخاب شده.");
					throw new Error("خطا در ثبت فاکتور های مورد انتخاب شده.");
				}

				try {
					inputs?.map(async (item, index) => {
						let res = await updateInspectionCostsMany({
							currency: currency,
							currencyRate: +rate?.replace(/,/g, ""),
							inspectionCostIds: data[Ids.costsIds],
						});
						if (res) {
							index === inputs?.length - 1
								? toast("نرخ ارزی با موفقیت بروزرسانی شد! ")
								: "";
						} else {
							throw new Error("بروزرسانی نرخ ارزی با خطا روبه رو شد!");
						}
					});
				} catch {
					throw new Error("بروزرسانی نرخ ارزی با خطا روبه رو شد!");
				}
			}
		});
	}, [currency, handleCalcualtePirce, hooks, inputs, rate, tableData]);

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
						{
							// fields[Ids.currency] === "rial" &&
							// fields[Ids.cashPay] === "false" &&
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
															? `${fields[Ids.bankSheba]?.slice(0, 2)} ${fields[
																	Ids.bankSheba
																]?.slice(2, 5)} ${fields[Ids.bankSheba]?.slice(
																	5,
																)}`
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
																)} ${fields[Ids.bankCardNumber]?.slice(12, 16)}`
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
																	parseInt(fields?.[Ids?.bankCardNumber] ?? ""),
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
						}

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
						{/* {watch()?.InputType === "official" && (
              <div className="flex flex-col w-[300px] m-2">
                <Label className="m-1">کد ملی</Label>
                <input
                  disabled={watch()?.InputType === "official"}
                  onKeyDown={() => null}
                  value={watch().UserInformation?.nationalCode as string}
                  className={`text-[.9rem] w-full my-2 pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0`}
                  placeholder={"کد ملی"}
                />
              </div>
            )} */}
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

					<div className="m-2 flex w-[300px] flex-col">
						<Label className="m-1">وضعیت</Label>
						<Select
							onValueChange={(value) =>
								setValue("ExpertState", value, {
									shouldValidate: true,
								})
							}
							value={`${
								fields[Ids.expertState] ? fields[Ids.expertState] : "nextStep"
							}`}
						>
							<SelectTrigger
								className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							>
								<SelectValue placeholder="انتخاب" />
							</SelectTrigger>
							<SelectContent>
								{ExpertStates.map((state, index) => (
									<SelectItem key={index} value={state.value}>
										<span className="px-2"> {state.label}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
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
						defaultValue="item-1"
						type="single"
						collapsible
						className="w-full px-2"
					>
						<AccordionItem value="item-1">
							<AccordionTrigger>پرداخت</AccordionTrigger>
							<AccordionContent>
								<div className="relative flex flex-col">
									<div className="flex">
										<div className="m-2 flex w-[300px] flex-col">
											<Label className="m-1">واحد پول</Label>
											<Select
												onValueChange={(e) => setCurrency(e)}
												disabled
												defaultValue="rial"
												value={currency}
											>
												<SelectTrigger
													className={`group relative text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[1rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												>
													<SelectValue placeholder="انتخاب" />
												</SelectTrigger>
												<SelectContent>
													{currencies.map((currency) => (
														<SelectItem
															value={currency.value}
															key={currency.value}
														>
															<span className="px-2">{currency.label}</span>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div className="m-2 flex w-[300px] flex-col justify-center">
											<Label className="m-1">نرخ ارز</Label>
											<input
												type="text"
												onChange={(e) => {
													const input = e.target.value.replace(/,/g, ""); // Remove commas for numeric operations
													if (!isNaN(Number(input))) {
														const formattedValue = new Intl.NumberFormat(
															"en-US",
														).format(Number(input));
														setRate(formattedValue);
													}
												}}
												value={rate}
												className={`group relative w-full text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"نرخ ارز"}
											/>
										</div>
									</div>

									<label className="mx-[1.5rem] mb-[1rem] flex select-none items-center">
										<Button
											type="button"
											className="bg-blue-500 text-white hover:bg-blue-600"
											onClick={handleAddInput}
										>
											<FaPlus size={16} className="mx-1" />
											افزودن
										</Button>
									</label>

									<PaymentByParts
										setInputs={(value) => {
											setInputs(value);
										}}
										inputs={inputs}
										rate={rate}
										currency={currency}
										onlyPrice
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
											{fields[Ids.currency] !== "rial" ? (
												<p className="my-1">
													باقی مانده به ریال:
													<Badge
														className={`mx-1`}
														variant={`${
															+fields[Ids.remainingAmount] < 0
																? "destructive"
																: "default"
														}`}
													>
														{addCommas(
															+fields[Ids.remainingAmount] *
																+rate?.replace(/,/g, ""),
														)}{" "}
													</Badge>
												</p>
											) : (
												""
											)}
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
													{addCommas(inputSum)}{" "}
													{fields[Ids.currency] === "dollar"
														? "دلار"
														: fields[Ids.currency] === "euro"
															? "یورو"
															: fields[Ids.currency] === "rial"
																? "ریال"
																: "یوان"}
												</Badge>
											</p>
											{fields[Ids.currency] !== "rial" ? (
												<p className="my-1">
													مجموع وارد شده به ریال:
													<Badge
														className={`mx-1`}
														variant={`${
															inputSum > +fields[Ids.amount]
																? "destructive"
																: "default"
														}`}
													>
														{addCommas(inputSum * +rate?.replace(/,/g, ""))}{" "}
													</Badge>
												</p>
											) : (
												""
											)}
										</div>
										<Button
											// disabled={
											//   JSON.stringify(fields[Ids.paidAmount]) ===
											//   JSON.stringify(inputs)
											// }
											type="button"
											onClick={handleCalcualtePirce}
											className="mt-5 w-16 self-end bg-blue-500 px-10 py-6 text-white hover:bg-blue-600"
										>
											بروزرسانی
										</Button>

										<Seperator className="mt-4 bg-white" />
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
