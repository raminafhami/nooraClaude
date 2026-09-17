"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";
import { BiCalendarX } from "react-icons/bi";
import { BsClipboardData } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import { toast } from "sonner";

import GetFormById from "@/api/forms/getFormById";
import PostFormSubmission from "@/api/forms/postFormSubmission";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import FormResultsModal, { TargetUser } from "./modal/FormResultsModal";

interface EvaluationTableProps {
	form: any;
	loading: boolean;
	isEditMode?: boolean;
	index: number;
	formId?: string;
}

interface SearchAttributeProps {
	searchInstructor?: string;
	searchName?: string;
}

const todayDate = moment(new Date()).locale("en").format("YYYY/MM/DD");

export function EvaluationTable({
	form,
	loading,
	isEditMode,
	index,
	formId,
}: EvaluationTableProps) {
	const [isShow, setShow] = useState<boolean>(false);
	const [isShowResultModal, setShowResultModal] = useState<boolean>(false);
	const [sumbitObject, setSumbitObject] = useState<any>({
		data: {},
		userId: "",
	});
	const [users, setUsers] = useState<any>();

	function toggleShow() {
		setShow(!isShow);
	}

	function resultModalHandle() {
		setShowResultModal(true);
		setShow(!!isShow);
	}

	function sendSubmissionForm(id: string) {
		try {
			let res = PostFormSubmission({
				data: sumbitObject.data,
				userId: sumbitObject.userId,
				id: id,
			});
			res.then((res) => {
				if (res) {
					toast.success("با موفقیت ارسال شد!");
					setTimeout(() => {
						setShow(false);
						setSumbitObject({
							data: {},
							userId: "",
						});
						FormById();
					}, 500);
				}
			});
		} catch {
			toast.error("خطایی رخ داد!");
		}
	}

	const FormById = useCallback(async () => {
		if (formId) {
			try {
				let res = await GetFormById({ id: formId });
				// Filter users with submission value null
				const filteredUsers = res.result.targetUsers.filter(
					(data: TargetUser) => data.submission === null,
				);
				// Check if there are any filtered users
				if (filteredUsers.length > 0) {
					setUsers(filteredUsers);
				} else {
					setUsers([]);
				}
			} catch (error) {
				toast.error("خطایی رخ داد!");
			}
		}
	}, [formId]);

	const addObject = (key?: string, value?: string, userId?: string) => {
		setSumbitObject((prevState: any) => ({
			data: {
				...prevState.data,
				...(key && value ? { [key]: +value * 20 } : {}),
			},
			...(userId ? { userId: userId } : { userId: prevState.userId }),
		}));
	};

	useEffect(() => {
		if (isEditMode && formId) {
			FormById();
		}
	}, [FormById, formId, isEditMode]);
	return (
		<div className={`!mt-[0]`}>
			{isShowResultModal && (
				<FormResultsModal
					formId={form.id}
					isShow={isShowResultModal}
					setShow={setShowResultModal}
				/>
			)}
			<Table.Cell
				className={`flex select-none items-center rounded ring-1 ring-gray-100 hover:bg-indigo-50 ${
					!isShow ? "mb-2 shadow" : ""
				}`}
			>
				{todayDate > moment(form.endDate).locale("en").format("YYYY/MM/DD") && (
					<p className="absolute right-1">
						<BiCalendarX size={15} className="text-red-700" />
					</p>
				)}
				<p className="mx-2 border-l-2 pl-2">{`شماره: ${++index}`}</p>

				<p className="mx-2 border-l-2 pl-2">{`عنوان: ${form.title}`}</p>

				<p className="mx-2 border-l-2 pl-2">
					{`شماره بازنگری: ${
						form.certificateCode ? form.certificateCode : "-"
					}`}
				</p>

				<p className="mx-2 border-l-2 pl-2">
					{`کد مدرک: ${form.formNo ? form.formNo : "-"}`}
				</p>

				<p className="mx-2 border-l-2 pl-2">
					{`تاریخ ایجاد: ${
						form.createdAt
							? moment(form.createdAt).locale("fa").format("YYYY/MM/DD")
							: "-"
					}`}
				</p>

				<p className={`pl-2 ${!isEditMode ? "border-l-2" : ""} mx-2`}>
					{`تاریخ انقضا : ${
						form.endDate
							? moment(form.endDate).locale("fa").format("YYYY/MM/DD")
							: "-"
					}`}
				</p>

				{!isEditMode && (
					<p className="mx-2 pl-[116px]">
						{`ارزیاب : ${form.evaluator.name} ${form.evaluator.lastname}`}
					</p>
				)}
				<button
					onClick={() => toggleShow()}
					className={`absolute ${
						isEditMode ? "left-0" : "left-20"
					} btn mx-[1.2rem] flex items-center rounded bg-gray-100 px-2 py-1 text-black hover:bg-blue-400 hover:text-white`}
				>
					{isShow ? <MdExpandLess size={13} /> : <MdExpandMore size={13} />}
				</button>
				{!isEditMode && (
					<>
						<button
							onClick={() => resultModalHandle()}
							className="btn absolute left-10 mx-[1.2rem] flex items-center rounded bg-gray-100 px-2 py-1 text-black hover:bg-blue-400 hover:text-white"
						>
							<BsClipboardData size={13} />
						</button>
						<DynamicLink
							className="absolute left-0 mx-[1.2rem] max-w-[29px]"
							href={`/dashboard/form-generator/${form.id}`}
						>
							<button className="btn flex items-center rounded bg-gray-100 px-2 py-1 text-black hover:bg-blue-400 hover:text-white">
								<FiEdit size={13} />
							</button>
						</DynamicLink>
					</>
				)}
			</Table.Cell>

			{isShow && (
				<Table.Root className="select-none">
					<Table.Head>
						<Table.Row className="select-none bg-gray-50 text-right">
							<Table.Cell as="th">ردیف</Table.Cell>

							<Table.Cell as="th">سوال</Table.Cell>
							{isEditMode && (
								<Table.Cell as="th" className="flex">
									<div className="ml-2 inline w-24 border-l-2 px-2 text-center">
										<p>خیلی خوب</p>
									</div>

									<div className="ml-2 inline w-24 border-l-2 px-2 text-center">
										<p>خوب</p>
									</div>

									<div className="ml-2 inline w-24 border-l-2 px-2 text-center">
										<p>متوسط</p>
									</div>

									<div className="ml-2 inline w-24 border-l-2 px-2 text-center">
										<p>نسبتا ضعیف</p>
									</div>

									<div className="ml-2 inline w-24 px-2 text-center">
										<p>ضعیف</p>
									</div>
								</Table.Cell>
							)}
						</Table.Row>
					</Table.Head>

					<Table.Body>
						{form.questions.length ? (
							form.questions.map((data: any, index: number) => (
								<Table.Row className="align-baseline" key={data.id}>
									<Table.Cell>{index + 1}</Table.Cell>
									<Table.Cell>
										<li key={index + data.title} className="mb-2">
											{data.title}
										</li>
									</Table.Cell>
									{isEditMode && (
										<Table.Cell>
											<div className="flex">
												<div
													onClick={() => {
														sumbitObject?.userId
															? addObject(data.questionId, "5")
															: toast.warning(
																	"ابتدا پرسنل مورد نظر خود را انتخاب کنید!",
																);
													}}
													className={`${
														sumbitObject?.data[data.questionId] === 100
															? "bg-blue-500 text-white"
															: ""
													} h-35 ml-2 w-24 cursor-pointer rounded border-l-2 px-2 py-2 text-center hover:bg-blue-500 hover:text-white`}
												>
													{toFarsiNum(5)}
												</div>

												<div
													onClick={() => {
														sumbitObject?.userId
															? addObject(data.questionId, "4")
															: toast.warning(
																	"ابتدا پرسنل مورد نظر خود را انتخاب کنید!",
																);
													}}
													className={`${
														sumbitObject?.data[data.questionId] === 80
															? "bg-blue-500 text-white"
															: ""
													} h-35 ml-2 w-24 cursor-pointer rounded border-l-2 px-2 py-2 text-center hover:bg-blue-500 hover:text-white`}
												>
													{toFarsiNum(4)}
												</div>

												<div
													onClick={() => {
														sumbitObject?.userId
															? addObject(data.questionId, "3")
															: toast.warning(
																	"ابتدا پرسنل مورد نظر خود را انتخاب کنید!",
																);
													}}
													className={`${
														sumbitObject?.data[data.questionId] === 60
															? "bg-blue-500 text-white"
															: ""
													} h-35 ml-2 w-24 cursor-pointer rounded border-l-2 px-2 py-2 text-center hover:bg-blue-500 hover:text-white`}
												>
													{toFarsiNum(3)}
												</div>

												<div
													onClick={() => {
														sumbitObject?.userId
															? addObject(data.questionId, "2")
															: toast.warning(
																	"ابتدا پرسنل مورد نظر خود را انتخاب کنید!",
																);
													}}
													className={`${
														sumbitObject?.data[data.questionId] === 40
															? "bg-blue-500 text-white"
															: ""
													} h-35 ml-2 w-24 cursor-pointer rounded border-l-2 px-2 py-2 text-center hover:bg-blue-500 hover:text-white`}
												>
													{toFarsiNum(2)}
												</div>

												<div
													onClick={() => {
														sumbitObject?.userId
															? addObject(data.questionId, "1")
															: toast.warning(
																	"ابتدا پرسنل مورد نظر خود را انتخاب کنید!",
																);
													}}
													className={`${
														sumbitObject?.data[data.questionId] === 20
															? "bg-blue-500 text-white"
															: ""
													} h-35 ml-2 w-24 cursor-pointer rounded border-l-2 px-2 py-2 text-center hover:bg-blue-500 hover:text-white`}
												>
													{toFarsiNum(1)}
												</div>
											</div>
										</Table.Cell>
									)}
								</Table.Row>
							))
						) : loading ? (
							<Table.Row key="loading">
								<Table.Cell></Table.Cell>

								<Table.Cell colSpan={100}>
									<Loading size="sm">در حال بارگذاری اطلاعات...</Loading>
								</Table.Cell>
							</Table.Row>
						) : (
							<Table.Row key="empty">
								<Table.Cell colSpan={100}>تخصصی یافت نشد.</Table.Cell>
							</Table.Row>
						)}
						{isEditMode && (
							<>
								<Table.Cell></Table.Cell>
								<Table.Cell></Table.Cell>
								<Table.Cell>
									<button
										onClick={() => {
											sumbitObject?.userId?.length &&
											Object.getOwnPropertyNames(sumbitObject.data).length ===
												form?.questions?.length
												? sendSubmissionForm(form.id)
												: toast.warning("اطلاعات ارسالی ناقص است!");
										}}
										className="btn float-left cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
									>
										ثبت
									</button>

									<select
										defaultValue={
											sumbitObject?.userId ? sumbitObject?.userId : "undefined"
										}
										onChange={(event) =>
											addObject(undefined, undefined, event.target?.value)
										}
										className="btn float-left ml-10 max-h-[36px] cursor-pointer rounded py-2 pl-4 pr-10 text-sm text-black hover:border-blue-700"
									>
										<option disabled value={"undefined"}>
											انتخاب
										</option>
										{users?.map(
											(user: any, index: number) =>
												user.submissionId === null && (
													<option
														selected={sumbitObject?.userId === user.user.id}
														value={user.user.id}
														key={user.user.id}
													>
														{`${user.user.name} ${user.user.lastname}`}
													</option>
												),
										)}
									</select>
								</Table.Cell>
							</>
						)}
					</Table.Body>
				</Table.Root>
			)}
		</div>
	);
}
