"use client";

import moment from "jalali-moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { BsFillTrashFill } from "react-icons/bs";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import PostNewForm from "@/api/forms/postNewForm";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { Evaluation, EvaluatorProps } from "../data/EvaluationFormTypes";
import DeleteForm from "./modules/DeleteForm";
import FormAssignTo from "./modules/FormAssignTo";
import FormEvaluator from "./modules/FormEvaluator";

interface FormGeneratorProps {
	data?: Evaluation;
}

interface FormAttributeProps {
	certificateCode?: string;
	indicatorId?: string;
	title?: string;
	assignTo?: string;
	evaluator?: string;
	deadline?: DateObject | any;
	questions?: any;
	endEvalNumber?: number;
	startEvalNumber?: number;
}

export function FormGenerator({ data }: FormGeneratorProps) {
	const [formAttribute, setFormAttribute] = useState<FormAttributeProps>();
	const [questions, setQuestions] = useState<any>();
	const [counter, setCounter] = useState(0);
	const [loading, setLoading] = useState<boolean>(true);
	const [isDeleteModal, setIsDeleteModal] = useState<boolean>(false);
	const [evaluater, setEvaluater] = useState<EvaluatorProps>();
	const [assignTo, setAssignTo] = useState<Array<string>>([]);

	const router = useRouter();
	let firstRender = true;
	function questionsGenerator(question: string, index: number) {
		setLoading(true);
		setCounter(counter + 1);

		if (questions?.includes(question)) {
			toast.warning("این سوال موجود است!");
		} else {
			const newQuestion = { questionId: index, title: question };
			setQuestions(questions ? [...questions, newQuestion] : [newQuestion]);
			toast.success("سوال با موفقیت اضافه شد!");
			if (formAttribute) {
				formAttribute.questions = "";
			}
		}

		setLoading(false);
	}

	function deleteQuestion(q: any) {
		setLoading(true);
		setQuestions(questions.filter((qu: any) => qu !== q));
		toast.success("با موفقیت حذف شد");
		setLoading(false);
	}

	async function saveData() {
		setLoading(true);
		let res;
		try {
			const {
				title,
				certificateCode,
				deadline,
				startEvalNumber,
				endEvalNumber,
			} = formAttribute || {};

			if (!certificateCode) {
				toast.warning("پر کردن شماره بازنگری ضروری است!");
			} else if (!title) {
				toast.warning("پر کردن عنوان ضروری است!");
			} else if (assignTo?.length === 0) {
				toast.warning("پر کردن گروه هدف ضروری است!");
			} else if (!evaluater) {
				toast.warning("پر کردن ارزیاب ضروری است!");
			} else if (!deadline) {
				toast.warning("پر کردن مهلت جوابدهی ضروری است!");
			} else if (!startEvalNumber || !endEvalNumber) {
				toast.warning("پر کردن فرمول محاسبه ضروری است!");
			} else if (!questions) {
				toast.warning("پر کردن سوال ها ضروری است!");
			} else {
				const formData = {
					title,
					evaluator: evaluater.id,
					groups: assignTo,
					questions,
					certificateCode,
					indicatorKey: "forms",
					endDate: moment(deadline).locale("en").format(),
					startEvalNumber,
					endEvalNumber,
				};
				res = await PostNewForm(formData);
			}

			if (res) {
				toast.success("با موفقیت ثبت شد");
				router.push("/dashboard/procedure");
				setFormAttribute(undefined);
			}
		} catch (e) {
			toast.warning("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		setLoading(true);
		if (data && firstRender) {
			setFormAttribute((prev) => ({
				...prev,
				certificateCode: data.certificateCode,
				title: data.title,
				deadline: data.endDate,
				startEvalNumber: data.startEvalNumber,
				endEvalNumber: data.endEvalNumber,
			}));
			setQuestions(data.questions);
		}
		setTimeout(() => {
			setLoading(false);
			firstRender = false;
		}, 300);
	}, [data]);
	return (
		<>
			{data && (
				<DeleteForm
					isShow={isDeleteModal}
					setShow={setIsDeleteModal}
					key={`deleteModal-${data?.id}`}
					data={data}
				/>
			)}
			{loading ? (
				<Loading />
			) : (
				<>
					<div className="my-10 flex items-center justify-between">
						<h1 className="select-none text-lg">
							{data ? `ویرایش ${data.title}` : "فرم جدید"}
						</h1>
						<div>
							{data && (
								<button
									onClick={() => setIsDeleteModal(true)}
									className="rounded bg-red-400 px-4 py-2 text-white hover:bg-red-500"
								>
									حذف
								</button>
							)}
							<button
								onClick={() => router.back()}
								className="mr-5 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
							>
								بازگشت
							</button>
						</div>
					</div>
					<div className="mb-10 flex w-full select-none flex-wrap items-start rounded-xl border-b-4 bg-gray-100 py-10 pr-10">
						<input
							className="mb-10 ml-20 rounded-xl border-white"
							type="text"
							placeholder="شماره بازنگری"
							onChange={(event) =>
								setFormAttribute((prev: any) => ({
									...prev,
									certificateCode: event.target.value.replace(/\D/g, ""),
								}))
							}
							value={formAttribute?.certificateCode}
						/>

						<input
							className="mb-10 ml-20 rounded-xl border-white"
							type="text"
							placeholder="عنوان"
							onChange={(event) =>
								setFormAttribute((prev: any) => ({
									...prev,
									title: event.target.value,
								}))
							}
							value={formAttribute?.title}
						/>

						<FormAssignTo setIds={setAssignTo} />

						<FormEvaluator evaluater={evaluater} setEvaluater={setEvaluater} />

						<DatePicker
							containerClassName="max-w-[223px] max-h-[42px] ml-20 mb-10 "
							calendar={persian}
							locale={persian_fa}
							inputClass="rounded-xl border-white"
							placeholder="مهلت جوابدهی"
							calendarPosition="bottom"
							minDate={moment(new Date()).locale("fa").format("YYYY/MM/DD")}
							onFocusedDateChange={(dateFocused, dateClicked) =>
								setFormAttribute((prev) => ({
									...prev,
									deadline: dateClicked?.toDate(),
								}))
							}
							value={formAttribute?.deadline}
							hideOnScroll
						/>

						<div className="relative select-none rounded-xl border-white">
							<input
								data-tooltip-id={"top"}
								type="number"
								className="w-20 rounded-xl rounded-l-[0] border-0 border-white pl-3 focus:ring-0"
								min={formAttribute?.startEvalNumber}
								max={99}
								placeholder="100"
								value={formAttribute?.endEvalNumber}
								onChange={(event) => {
									if (formAttribute?.startEvalNumber) {
										setFormAttribute((prev) => ({
											...prev,
											endEvalNumber:
												+event.target.value < 100 &&
												+event.target.value >
													(formAttribute?.startEvalNumber || 1)
													? +event.target.value
													: 99,
										}));
									}
								}}
							/>

							<span className="top-.1 absolute right-3.5 text-2xl text-gray-500">{`>`}</span>

							<input
								data-tooltip-id={"middle"}
								type="number"
								className="w-20 rounded-xl rounded-l-[0] rounded-r-[0] border-0 border-white pl-3"
								placeholder="وسط"
								disabled
							/>

							<span className="left-5.4 top-.1 absolute text-2xl text-gray-500">{`>`}</span>

							<input
								data-tooltip-id={"under"}
								type="number"
								className="w-20 rounded-xl rounded-r-[0] border-0 border-white pl-3 focus:ring-0"
								min={0}
								max={formAttribute?.endEvalNumber}
								placeholder="10"
								value={formAttribute?.startEvalNumber}
								onChange={(event) => {
									setFormAttribute((prev) => ({
										...prev,
										startEvalNumber:
											+event.target.value > 0 &&
											+event.target.value < (formAttribute?.endEvalNumber || 99)
												? +event.target.value
												: 1,
									}));
								}}
							/>
						</div>
					</div>

					<Tooltip id="under">قطع همکاری</Tooltip>
					<Tooltip id="middle">نیاز به آموزش</Tooltip>
					<Tooltip id="top">ادامه همکاری</Tooltip>

					<div className="mb-10 select-none rounded-xl border-b-4 bg-gray-100">
						<h1 className="mb-10 mr-[2.5rem] pt-[1rem] text-lg">سوالات</h1>
						<div className="space-between group relative flex">
							<input
								onKeyDown={(event) =>
									event.key === "Enter" && formAttribute?.questions.length > 5
										? questionsGenerator(formAttribute?.questions, counter)
										: null
								}
								className="mb-10 ml-5 mr-[2.5rem] w-40 rounded-xl border-white pl-10 pt-[1rem]"
								type="text"
								placeholder="سوال"
								onChange={(event) =>
									setFormAttribute((prev: any) => ({
										...prev,
										questions: event.target.value
											.replace(/^\s+/, "")
											.replace(/\s\s+/g, " "),
									}))
								}
								value={formAttribute?.questions}
							/>
							<button
								className={`btn h-[2rem] rounded bg-blue-500 px-4 text-white hover:bg-blue-700 ${
									formAttribute?.questions?.length > 5
										? "cursor-pointer text-green-500"
										: "hidden text-gray-200"
								}`}
								onClick={() =>
									formAttribute?.questions.length > 5
										? questionsGenerator(formAttribute?.questions, counter)
										: null
								}
							>
								افزودن
							</button>
						</div>
					</div>

					<Layout.Content className="mt-10 p-0">
						<Panel.Root>
							<Panel.Container>
								<Table.Root>
									<Table.Head>
										<Table.Row className="select-none bg-gray-100 text-right">
											{!questions || questions?.length === 0 ? (
												""
											) : (
												<>
													<Table.Cell as="th">ردیف</Table.Cell>
													<Table.Cell as="th">سوال</Table.Cell>
													<Table.Cell as="th"></Table.Cell>
												</>
											)}
										</Table.Row>
									</Table.Head>
									<Table.Body>
										{!questions || questions?.length === 0 ? (
											<Table.Row>
												<Table.Cell>سوالی یافت نشد...</Table.Cell>
											</Table.Row>
										) : (
											questions.map((q: any, index: number) => (
												<Table.Row key={index}>
													<Table.Cell as="td">{++index}</Table.Cell>
													<Table.Cell as="td">{q.title}</Table.Cell>
													<Table.Cell as="td">
														<BsFillTrashFill
															data-tooltip-id={q}
															size={17}
															className={`mr-2 inline cursor-pointer text-red-400 hover:text-red-500 focus:outline-0`}
															onClick={() => deleteQuestion(q)}
														/>
													</Table.Cell>
													<Tooltip id={q}>حذف</Tooltip>
												</Table.Row>
											))
										)}
									</Table.Body>
								</Table.Root>
							</Panel.Container>
						</Panel.Root>
					</Layout.Content>
					<div className="mt-10 flex justify-end">
						<button
							className={`btn mb-[1rem] rounded bg-blue-500 px-28 py-2 text-white hover:bg-blue-700 ${
								formAttribute && questions?.length > 0
									? ""
									: "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
							}`}
							onClick={() =>
								formAttribute && questions.length > 0 ? saveData() : null
							}
						>
							{loading ? (
								<Loading size={"sm"} />
							) : data ? (
								"ثبت تغییرات"
							) : (
								"ساخت فرم"
							)}
						</button>
					</div>
				</>
			)}
		</>
	);
}
