import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { MdUpdate } from "react-icons/md";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import PostAudit from "@/api/assetRequirement/postAudit";
import PutAudit from "@/api/assetRequirement/putAudit";
import { useTableStore } from "@/cache/store/tableStore";
import { Button } from "@/components/ui/button";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

import { AuditType } from "../../[id]/_components/types/auditType";
import AssignGroupAudit from "../modules/AssignGroupAudit";
import AssignUserAudit, { Person } from "../modules/AssignUserAudit";
import CategoryTypes from "../modules/AuditTypes";
import FindUser from "../modules/FindUser";

interface AddAuditProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data?: AuditType;
	getData: () => void;
	isEdit: boolean;
	isRisk?: boolean;
}

interface FormAttributeProps {
	title: string;
	auditNo: string;
	category: string;
	reviewNumber: string;
	date: any;
	state: string;
	producerId: any;
	seconderId: any;
	approverId: any;
	changeDescription?: string;
	AssigneUsers: Person[];
	AssigneGroups: any[];
}

export default function AddAudit({
	isShow,
	setShow,
	data,
	getData,
	isEdit,
	isRisk,
}: AddAuditProps) {
	const { setTableData, getTableData } = useTableStore();

	const [loading, setLoading] = useState<boolean>(false);
	const [formAttribuite, setFormAttribuite] = useState<FormAttributeProps>();

	async function newAudit(isReview?: boolean) {
		setLoading(true);
		let res;
		try {
			const {
				title,
				approverId,
				category,
				date,
				auditNo,
				producerId,
				reviewNumber,
				seconderId,
				state,
			} = formAttribuite || {};

			if (!title) {
				toast.warning("پر کردن عنوان ضروری است!");
			} else if (!approverId) {
				toast.warning("پر کردن تایید کننده ضروری است!");
			} else if (!auditNo) {
				toast.warning("پر کردن تایید کننده ضروری است!");
			} else if (!category) {
				toast.warning("پر کردن دسته بندی ضروری است!");
			} else if (!date) {
				toast.warning("پر کردن تاریخ صدور ضروری است!");
			} else if (!producerId) {
				toast.warning("پر کردن تهیه کننده ضروری است!");
			} else if (!reviewNumber) {
				toast.warning("پر کردن شماره بازنگری ضروری است!");
			} else if (!seconderId) {
				toast.warning("پر کردن صدور کننده ضروری است!");
			} else {
				res =
					isEdit && data && !isReview
						? await PutAudit({
								title: title,
								approverId: approverId.id,
								category,
								date,
								changeDescription: formAttribuite?.changeDescription,
								auditNo: (() => {
									switch (category) {
										case "دستورالعمل":
											return `NAIT-WI-${auditNo}`;
										case "روش اجرایی":
											return `NAIT-PR-${auditNo}`;
										case "قرارداد":
											return `NAIT-CT-${auditNo}`;
										case "خط مشی کیفیت":
											return `NAIT-QP-${auditNo}`;
										case "اهداف کیفیت":
											return `NAIT-QG-${auditNo}`;
										case "تعهدنامه بی طرفی":
											return `NAIT-IS-${auditNo}`;
										case "منشور اخلاقی":
											return `NAIT-CO-${auditNo}`;
										case "چارت سازمانی":
											return `NAIT-OC-${auditNo}`;
										case "ممیزی داخلی":
											return `NAIT-RI-${auditNo}`;
										case "فرم":
											return `NAIT-FR-${auditNo}`;
										case "نظامنامه کیفیت":
											return `NAIT-QM-${auditNo}`;
										default:
											return "";
									}
								})(),
								producerId: producerId.id,
								reviewNumber,
								seconderId: seconderId.id,
								state:
									state === "true" ? true : state === "false" ? false : true,
								id: data?.id,
								userGroups: formAttribuite?.AssigneGroups?.map(
									(user) => user?.id,
								),
								users: formAttribuite?.AssigneUsers?.map((user) => user?.id),
							})
						: await PostAudit({
								title: isReview && data ? data?.title : title,
								approverId:
									isReview && data ? data?.approver?.id : approverId.id,
								category: isReview && data ? data?.category : category,
								date: isReview && data ? data?.date : date,
								auditNo:
									isReview && data
										? data?.auditNo
										: (() => {
												switch (category) {
													case "دستورالعمل":
														return `NAIT-WI-${auditNo}`;
													case "روش اجرایی":
														return `NAIT-PR-${auditNo}`;
													case "قرارداد":
														return `NAIT-CT-${auditNo}`;
													case "خط مشی کیفیت":
														return `NAIT-QP-${auditNo}`;
													case "اهداف کیفیت":
														return `NAIT-QG-${auditNo}`;
													case "تعهدنامه بی طرفی":
														return `NAIT-IS-${auditNo}`;
													case "منشور اخلاقی":
														return `NAIT-CO-${auditNo}`;
													case "چارت سازمانی":
														return `NAIT-OC-${auditNo}`;
													case "ممیزی داخلی":
														return `NAIT-RI-${auditNo}`;
													case "فرم":
														return `NAIT-FR-${auditNo}`;
													case "نظامنامه کیفیت":
														return `NAIT-QM-${auditNo}`;
													default:
														return "";
												}
											})(),
								producerId:
									isReview && data ? data?.producer?.id : producerId.id,
								reviewNumber:
									isReview && data
										? (+data?.reviewNumber + 1).toString()
										: reviewNumber,
								seconderId:
									isReview && data ? data?.producer?.id : seconderId.id,
								state: isReview
									? true
									: state === "true"
										? true
										: state === "false"
											? false
											: true,
							});
			}
			if (res) {
				toast.success(
					`${isEdit ? "با موفقیت ویرایش شد!" : "با موفقیت اضافه شد!"}`,
				);
				// sendNewAsset(null, res.result.id);
				setTimeout(() => {
					setTableData({
						tableName: isRisk ? "AuditRiskTable" : "AuditTable",
						page: 0,
						size: 10,
						filters: {},
					});
					getData();
					setLoading(false);
					setShow(false);
				}, 300);
			}
		} catch (e) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
		setLoading(false);
	}
	useEffect(() => {
		if (isEdit && data) {
			setFormAttribuite((prev: any) => ({
				...prev,
				title: data?.title,
				category: data?.category,
				date: data?.date,
				changeDescription: data?.changeDescription,
				approverId: data?.approver,
				producerId: data?.producer,
				seconderId: data?.seconder,
				state: data?.state === true ? "true" : "false",
				reviewNumber: data?.reviewNumber,
				auditNo: data?.auditNo
					.replace(/[^\d.-]+/g, "")
					.replace("-", "")
					.replace("-", ""),
				AssigneUsers: data?.users,
				AssigneGroups: data?.userGroups,
			}));
		}
	}, [data, isEdit]);
	return (
		<>
			{
				<MyModal
					size="6xl"
					title="افزودن چک لیست"
					content={
						<>
							<div className="mt-0 flex flex-col">
								<div className="select-none">
									<div className="flex flex-wrap rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1">
										<div className="flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												عنوان
											</label>
											<input
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														title: event.target.value,
													}))
												}
												value={formAttribuite?.title}
												className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"عنوان"}
											/>
										</div>
										<div className="flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												کد
											</label>
											<input
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														auditNo: event.target.value
															.replace(/[^\d.-]+/g, "")
															.replace("-", ""),
													}))
												}
												value={formAttribuite?.auditNo
													?.replace(/[^\d.-]+/g, "")
													?.replace("-", "")
													?.replace("-", "")}
												className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"عنوان"}
											/>
										</div>
										<div className="flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												دسته بندی
											</label>
											<select
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														category: event.target.value,
													}))
												}
												onKeyDown={() => null}
												className={`border-1 group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												defaultValue={
													formAttribuite?.category
														? formAttribuite?.category
														: "undefined"
												}
											>
												<option
													value={"undefined"}
													disabled
													selected={formAttribuite?.category ? false : true}
												>
													انتخاب
												</option>
												{CategoryTypes.map((types, index) =>
													isRisk
														? types.value === "ممیزی داخلی" && (
																<option
																	key={types.code}
																	value={types.value}
																	selected={
																		formAttribuite?.category &&
																		formAttribuite?.category === types.value
																			? true
																			: false
																	}
																>
																	{types.value}
																</option>
															)
														: types.value !== "ممیزی داخلی" && (
																<option
																	key={types.code}
																	value={types.value}
																	selected={
																		formAttribuite?.category &&
																		formAttribuite?.category === types.value
																			? true
																			: false
																	}
																>
																	{types.value}
																</option>
															),
												)}
											</select>
										</div>

										<div className="flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												شماره بازنگری
											</label>
											<input
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														reviewNumber: event.target.value.replace(
															/[^\d.-]+/g,
															"",
														),
													}))
												}
												value={formAttribuite?.reviewNumber}
												className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"شماره بازنگری"}
											/>
										</div>

										<div className="flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												تاریخ صدور
											</label>
											<DatePicker
												containerClassName="max-w-[300px] max-h-[42px] mb-10 mx-[1rem]"
												calendar={persian}
												locale={persian_fa}
												inputClass={`w-[300px] text-[.9rem] mb-[1rem] pl-[.5rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
												placeholder="تاریخ صدور"
												calendarPosition="bottom"
												onFocusedDateChange={(dateFocused, dateClicked) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														date: dateClicked?.toDate(),
													}))
												}
												value={formAttribuite?.date}
												hideOnScroll
											/>
										</div>

										<div className="flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												وضعیت
											</label>
											<select
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														state: event.target.value,
													}))
												}
												className={`border-1 group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												defaultValue={
													formAttribuite?.state === "true"
														? "true"
														: formAttribuite?.state === "false"
															? "false"
															: "undefined"
												}
											>
												<option
													value={"undefined"}
													disabled
													selected={formAttribuite?.state ? false : true}
												>
													انتخاب
												</option>
												<option
													key={"standard"}
													value={"true"}
													selected={
														formAttribuite?.state &&
														formAttribuite?.state === "true"
															? true
															: false
													}
												>
													تحت کنترل
												</option>
												<option
													key={"audit"}
													value={"false"}
													selected={
														formAttribuite?.state &&
														formAttribuite?.state === "false"
															? true
															: false
													}
												>
													منسوخ شده
												</option>
											</select>
										</div>
										{isEdit && (
											<div className="flex flex-col">
												<label className="mx-[1.5rem] my-[.5rem] select-none">
													شرح تغییرات
												</label>
												<textarea
													onChange={(event) =>
														setFormAttribuite((prev: any) => ({
															...prev,
															changeDescription: event.target.value,
														}))
													}
													value={formAttribuite?.changeDescription}
													className={`group relative mx-[1rem] mb-[1rem] max-h-[10em] min-h-[5em] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
													placeholder={"شرح تغییرات"}
												/>
											</div>
										)}
										{isEdit && (
											<div className="flex flex-col">
												<label className="mx-[1.5rem] my-[.5rem] select-none">
													تخصیص به پرسنل
												</label>
												<AssignUserAudit
													setIds={(v) => {
														setFormAttribuite((prev: any) => ({
															...prev,
															AssigneUsers: v,
														}));
													}}
													ids={formAttribuite?.AssigneUsers ?? []}
												/>
											</div>
										)}
										{isEdit && (
											<div className="flex flex-col">
												<label className="mx-[1.5rem] my-[.5rem] select-none">
													تخصیص به گروه
												</label>
												<AssignGroupAudit
													setIds={(v) => {
														setFormAttribuite((prev: any) => ({
															...prev,
															AssigneGroups: v,
														}));
													}}
													ids={formAttribuite?.AssigneGroups ?? []}
												/>
											</div>
										)}
										<div className="mt-5 flex flex-wrap border-t-2 pt-5">
											<div className="mx-2 mb-2 flex w-[300px] flex-col">
												<label className="mx-[.5rem] my-[.5rem] select-none">
													تهیه کننده
												</label>
												<FindUser
													setUser={(value) =>
														setFormAttribuite((prev: any) => ({
															...prev,
															producerId: value,
														}))
													}
													user={formAttribuite?.producerId}
													type="personnel"
												/>
											</div>

											<div className="mx-2 mb-2 flex w-[300px] flex-col">
												<label className="mx-[.5rem] my-[.5rem] select-none">
													تایید کننده
												</label>
												<FindUser
													user={formAttribuite?.seconderId}
													setUser={(value) =>
														setFormAttribuite((prev: any) => ({
															...prev,
															seconderId: value,
														}))
													}
													key={"find"}
													type="personnel"
												/>
											</div>

											<div className="mx-2 mb-2 flex w-[300px] flex-col">
												<label className="mx-[.5rem] my-[.5rem] select-none">
													تصویب کننده
												</label>
												<FindUser
													user={formAttribuite?.approverId}
													setUser={(value) =>
														setFormAttribuite((prev: any) => ({
															...prev,
															approverId: value,
														}))
													}
													key={"find"}
													type="personnel"
												/>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-4 flex w-full flex-row-reverse gap-x-4">
									<Button
										className="md:w-32"
										onClick={() => !loading && newAudit(false)}
									>
										{loading ? (
											<Loading size="sm" />
										) : isEdit ? (
											"ویرایش"
										) : (
											"ثبت"
										)}
									</Button>

									{isEdit && (
										<Button
											className="md:w-32"
											onClick={() => !loading && newAudit(true)}
										>
											{loading ? (
												<Loading size="sm" />
											) : (
												<>
													<MdUpdate className="me-1 inline" size={15} />
													بازنگری مجدد
												</>
											)}
										</Button>
									)}
								</div>
							</div>
						</>
					}
					name="addParticipant"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
