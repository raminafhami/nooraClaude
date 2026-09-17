import moment from "jalali-moment";
import Image from "next/image";
import React from "react";

import logo from "@/assets/images/nait-logo.png";
import { Task } from "@/felo/tasks/models/Task";

import { Ids } from "../../data/Ids";
import { FormData } from "./PhasePage";

export const ProductionPreview = ({
	task,
	data,
}: {
	task: Task;
	data: FormData;
}) => {
	return (
		<div
			className="flex justify-center bg-gray-50 sm:p-4"
			suppressHydrationWarning
		>
			<div className="w-full bg-white sm:w-[21cm] sm:p-4">
				<div className="mx-auto my-0 block overflow-hidden text-xs">
					<div className="m-5 mb-1">
						<div className="flex justify-between">
							<div className="pb-2">
								<Image src={logo} alt="logo" width={80} height={80}></Image>
							</div>
							<div className="mb-5 text-center">
								<div className="text:xl md:text-2xl">نورا آزما بین الملل</div>
								<div className="text:lg md:text-lg">
									بازرسی و خدمات آزمایشگاهی
								</div>
								<div className="text-sm md:text-base">
									گزارش بازدید و نمونه برداری
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<div>
									تاریخ: {getDatesIngregorian(new Date().toLocaleDateString())}
								</div>
								<div>
									شماره:
									{/* {data?.PageNo} */}
								</div>
							</div>
						</div>
						<div className="border border-black text-xs">
							<div className="flex border-b border-black">
								<div className="w-1/2 border-l border-black p-1 text-2xs xs:text-xs">
									بارکد فیزیکی نمونه:
								</div>
								<div className="w-1/2 p-1">
									بارکد سامانه: {data?.SystemBarcode}
								</div>
							</div>
							<div className="border-b border-black p-2 text-2xs leading-7 xs:text-xs xs:leading-7">
								<div>
									نام و نشانی واحد نمونه برداری شده:{" "}
									{task.data?.[Ids.buyerName]} - {task.data?.[Ids.buyerAddress]}
								</div>
								<div>تاریخ نمونه برداری: {data?.Date}</div>
								<div className="flex flex-wrap">
									<span>محل نمونه برداری:</span>
									<span className="mr-5 flex items-center gap-1">
										<input
											type="checkbox"
											id="1"
											className="accent-black"
											checked={data?.Place === "خط تولید کارخانه"}
										/>
										<label htmlFor="1">خط تولید کارخانه</label>
									</span>
									<span className="mr-5 flex items-center gap-1">
										<input
											type="checkbox"
											id="2"
											className="accent-black"
											checked={data?.Place === "انبار واحد تولیدی"}
										/>
										<label htmlFor="2">انبار واحد تولیدی</label>
									</span>
									<span className="mr-5 flex items-center gap-1">
										<input
											type="checkbox"
											id="3"
											className="accent-black"
											checked={data?.Place === "انبار عرضه کننده"}
										/>
										<label htmlFor="3">انبار عرضه کننده</label>
									</span>
									<span className="mr-5 flex items-center gap-1">
										<input
											type="checkbox"
											id="4"
											className="accent-black"
											checked={data?.Place === "فروشگاه (بازار)"}
										/>
										<label htmlFor="4">فروشگاه (بازار)</label>
									</span>
								</div>
								<div className="flex gap-5">
									<span>نوع:</span>
									<span className="mr-5 flex items-center gap-1">
										<input
											type="checkbox"
											id="5"
											className="accent-black"
											checked={data?.Type === "امانی"}
										/>
										<label htmlFor="5">امانی</label>
									</span>
									<span className="mr-5 flex items-center gap-1">
										<input
											type="checkbox"
											id="6"
											className="accent-black"
											checked={data?.Type === "غیر امانی"}
										/>
										<label htmlFor="6">غیر امانی</label>
									</span>
								</div>
							</div>
							{data?.ProductsData?.map((product, index) => (
								<div key={index}>
									<div className="border-b border-black p-2 text-2xs leading-7 xs:text-xs xs:leading-7">
										<div>مشخصات نمونه:</div>
										<div className="flex items-center justify-between">
											<span className="w-1/2">
												نام و نوع محصول: {product?.ProductName}{" "}
												{product?.ProductType}
											</span>
											<span className="w-1/2">
												مدل/جزئیات: {product?.Model}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<div className="w-1/2">
												نام یا علامت تجاری: {product?.Brand}
											</div>
											<div className="w-1/2">
												تاریخ تولید: {product?.ManufactureDate}
											</div>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex w-1/2 items-center gap-1">
												شماره پروانه بهداشتی بسته بندی:
												<span className="inline-block w-44 rounded-md border border-black px-2">
													{" "}
													{product?.PackageNo}
												</span>
											</div>
											<div className="flex w-1/2 items-center gap-1">
												شماره پروانه بهداشتی ساخت:
												<span className="inline-block w-44 rounded-md border border-black px-2">
													{product?.BuildNo}
												</span>
											</div>
										</div>
										<div className="flex items-center justify-between">
											<span className="w-1/2">
												شماره پلمب:{" "}
												{Array.from(
													new Set(
														data?.ProductsData?.flatMap(
															(i) =>
																(i?.PackingType?.length &&
																	i?.PackingType?.map(
																		(entry) => entry?.ProductName,
																	)) ||
																[],
														),
													),
												)
													.map((productName) => {
														const entries = data?.ProductsData?.flatMap(
															(i) =>
																i?.PackingType?.filter(
																	(entry) => entry?.ProductName === productName,
																) || [],
														);

														const codes = entries
															.flatMap((entry) => entry?.codes || [])
															.map((code) => `NAIT${code}`)
															.join(", ");

														return ` ${codes}`;
														// ${productName}:
													})
													.join(" - ")}
											</span>
											<span className="w-1/2">
												سری ساخت: {product?.ConstructionSeries}
											</span>
										</div>
										<div className="pb-1">
											سایر ملاحظات - شماره کوتاژ - مقدار و مشخصات فیزیکی (رنگ،
											اندازه، نوع بسته بندی و ........):
											<br />
											مقدار : {product?.SampleAmount} -{" "}
											{product?.PhysicalCharacteristics}
										</div>
									</div>
									<div className="border-b border-black p-2 text-2xs leading-6 xs:text-xs xs:leading-6">
										<div className="flex justify-between">
											<div>
												نمونه شاهد با شماره پلمب:{" "}
												{Array.from(
													new Set(
														data?.ProductsData?.flatMap(
															(i) =>
																(i?.ControlSample?.length &&
																	i?.ControlSample?.flatMap((entry: any) =>
																		entry?.length
																			? entry?.map(
																					(subEntry: any) =>
																						subEntry?.ProductName,
																				)
																			: "",
																	)) ||
																[],
														),
													),
												)
													.map((productName) => {
														const entries = data?.ProductsData?.flatMap(
															(i) =>
																i?.ControlSample?.flatMap((entry: any) =>
																	entry?.length
																		? entry?.filter(
																				(subEntry: any) =>
																					subEntry?.ProductName === productName,
																			)
																		: "",
																) || [],
														);

														const codes = entries
															.flatMap((entry) => entry?.codes || [])
															.map((code) => `NAIT${code}`)
															.join(", ");

														return `${productName}: ${codes}`;
													})
													.join(" - ")}
											</div>
											<div className="ml-16 flex items-center gap-2">
												<span> به صاحب کالا تحویل داده </span>
												<span className="flex items-center gap-1">
													<input
														type="checkbox"
														id="7"
														className="accent-black"
														checked={product?.Delivered === "true"}
													/>
													<label htmlFor="7">شد</label>
												</span>
												<span className="flex items-center gap-1">
													<input
														type="checkbox"
														id="8"
														className="accent-black"
														checked={product?.Delivered === "false"}
													/>
													<label htmlFor="8">نشد</label>
												</span>
											</div>
										</div>
										<span className="flex items-center gap-1">
											<input
												type="checkbox"
												id="9"
												className="accent-black"
												checked={
													product?.ControlSample[index]?.status === "false"
												}
											/>
											<label htmlFor="9">
												یا صاحب کالا مایل به احذ نمونه شاهد، تحویل و نگهداری آن
												نبوده و حق اعتراض را از خود سلب می‌نماید.
											</label>
										</span>
									</div>
									<div className="border-b border-black p-2 text-2xs leading-6 xs:text-xs xs:leading-6">
										توضیحات: {product?.Descriptions}
									</div>
								</div>
							))}
							<div className="flex border-b border-black text-2xs leading-6 xs:text-xs xs:leading-6">
								<div className="w-1/3 border-l border-black p-2 pb-14">
									نام و نام خانوادگی نمونه بردار: {task.data?.[Ids.samplerName]}
									{task.data?.[Ids.samplerSignature] &&
										task.data?.[Ids.samplerSignature] !== undefined &&
										task.data?.[Ids.samplerSignature] !== "" && (
											<Image
												src={task.data?.[Ids.samplerSignature]}
												alt=""
												width={100}
												height={100}
												className="mx-auto"
											/>
										)}
								</div>
								<div className="w-1/3 border-l border-black p-2">
									نام و نام خانوادگی مدیر/ نماینده واحد تولیدی:{" "}
									{data?.ProductionUnitName}
									{data?.ProductiveSignature &&
										data?.ProductiveSignature !== undefined &&
										data?.ProductiveSignature !== "" && (
											<Image
												src={data?.ProductiveSignature}
												alt=""
												width={100}
												height={100}
												className="mx-auto"
											/>
										)}
								</div>
								<div className="w-1/3 p-2 pb-14">
									نام و نام خانوادگی مدیر کنترل کیفیت: : {data?.QcName}
									{data?.QcSignature &&
										data?.QcSignature !== undefined &&
										data?.QcSignature !== "" && (
											<Image
												src={data?.QcSignature}
												alt=""
												width={100}
												height={100}
												className="mx-auto"
											/>
										)}
								</div>
							</div>
							<div className="border-b border-black p-2 text-2xs leading-6 xs:text-xs xs:leading-6">
								مدیر محترم آزمایشگاه {data?.LaboratoryManager} نمونه با مشخصات
								فوق جهت انجام آزمون‌های مربوطه برطبق استاندارهای ملی ارسال
								میگردد و خواهشمند است ضمن اخذ هزینه‌های مربوطه از صاحب کالا
								دستور فرمایید نتایج را به اداره کل استاندارد استان ارسال
								فرمایید.
							</div>
							<div className="border-b border-black p-2 text-2xs leading-6 xs:text-xs xs:leading-6">
								<div className="pb-2 text-center">صورتحساب نمونه برداری</div>
								<div>
									هزینه نمونه برداری با احتساب مالیات بر ارزش افزوده مبلغ{" "}
									{+data?.Price * 0.1 + +data?.Price} ریال می‌باشد.
								</div>
								<div className="flex items-center gap-2">
									<span>پرداخت</span>
									<span className="flex items-center gap-1">
										<input
											type="checkbox"
											id="10"
											className="accent-black"
											checked={false}
										/>
										<label htmlFor="10">شد</label>
									</span>
									<span className="flex items-center gap-1">
										<input
											type="checkbox"
											id="11"
											className="accent-black"
											checked={false}
										/>
										<label htmlFor="11">نشد</label>
									</span>
								</div>
								<div className="leading-6 xs:leading-6">
									خواهشمند است مبلغ فوق را به شماره حساب ۱۷۱۸۰۰۱۸۵۴۰۲ یا شماره
									کارت ۵۸۹۲۱۰۷۰۴۴۰۲۲۴۷۶ شماره شبا IR۰۸۰۱۵۰۰۰۰۰۰۰۱۷۱۸۰۰۱۸۵۴۰۲
									بانک سپه به نام شرکت نورآزما بین الملل واریز و فیش واریزی را
									با درج نام واحد تولیدی، به شماره فکس ۰۲۱-۹۱۳۰۴۵۰۰ یا به شماره
									ایتا ۰۹۱۹۸۱۱۴۴۵۰ ارسال نمایید.
								</div>
							</div>
							<div className="border-b border-black p-2 text-2xs text-[0.6rem] leading-6 xs:text-xs xs:leading-6">
								<div className="pb-2 text-center">
									آیین نامه بازرسی نمونه برداری فرآورده‌های استاندارد شده
								</div>
								<div>
									ماده ۸: استاندارد باقیمانده نمونه: هرگاه پس از انجام آزمایش
									باقیمانده نمونه قابل استفاده یا تبدیل باشد صاحب کالا موظف است
									حداکثر ظرف مدت ۲۰ روز برای کالای فاسد شدنی و ۲ ماه برای سایر
									کالاها از تاریخ صدور نتایج آزمون مراجعه و باقیمانده نمونه خود
									را در مقابل دادن رسید دریافت نماید. عدم مراجعه صاحب کالا در
									مدت‌های تعیین شده به مفهوم انصراف از دریافت نمونه‌های مذکور
									نلالی و اداره کل استاندارد می‌تواند از آنها به نحو مقتضی درجهت
									تحقق اهداف خود استفاده نماید.
								</div>
								<div>
									ماده ۹: هرگاه اجرای استاندارد در مورد کالایی، اجباری اعلام
									شود، پس از انقضای مهلت مقر، تمرکز و توزیع و فروش این گونه
									کالاها با کیفیت پایین‌تر از استاندارد مربوط و یا بدون علامت
									استاندارد ایران ممنوع و با رعایت شرایط و امکانات خاصی و دفعات
									و مراتب تعزیز اعم از احضا و علا، تذکر، توبخ، تهدید و اخذ تعهد
									و حبس از ۱ ماه تا ۲ سال جزای نقدی از یکصد هزار ریال تا پنجاه
									میلیون ریال به حکم محاکم محکوم خواهد شد. در صورتی که مسئول
									واحد نمونه برداری شده از دریافت نمونه شاهد خودداری نماید، حق
									اعتراض به نتایح آزمون را از خود سلب می‌نماید. مدت اعتبار نمونه
									شاهد دوماه پس از تاریخ صدور نتایج آزمون می‌باشد. در مورد
									کالاهای فاسد شدنی، نمونه شاهد در مدت اعتبار ذکر شده بروی کالا
									معتبر خواهد بود.
								</div>
								<div className="underline">
									تذکر مهم: صاحب کالا مکلف است حداکثر ۲۴ ساعت پس از نمونه
									برداری، نمونه را به اداره استاندارد استان تحویل نماید.
								</div>
							</div>
							<div className="flex justify-between border-b border-black p-2 text-2xs xs:text-xs">
								<div className="flex flex-col justify-center gap-2">
									<div className="flex items-center">
										<svg
											height="15"
											viewBox="0 0 48 48"
											width="15"
											xmlns="http://www.w3.org/2000/svg"
											className="pl-1"
										>
											<path d="M24 4c-7.73 0-14 6.27-14 14 0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14zm0 19c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
											<path d="M0 0h48v48H0z" fill="none" />
										</svg>
										<span>
											دفتر تهران: زعفرانیه، خیابان پسیان، نبش جامی شرقی، پلاک
											۲۸، ساختمان پیدایش، واحد C شمالی
										</span>
										<span className="flex items-center pr-10">
											<span>۰۲۱-۹۱۳۰۴۵۰</span>
											<span>
												<svg
													height="15"
													viewBox="0 0 24 24"
													width="15"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z" />
													<path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z" />
												</svg>
											</span>
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="flex items-center">
											<span>
												<svg
													height="15"
													viewBox="0 0 48 48"
													width="15"
													xmlns="http://www.w3.org/2000/svg"
													className="pl-1"
												>
													<path d="M24 4c-7.73 0-14 6.27-14 14 0 10.5 14 26 14 26s14-15.5 14-26c0-7.73-6.27-14-14-14zm0 19c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
													<path d="M0 0h48v48H0z" fill="none" />
												</svg>{" "}
											</span>
											<span>دفتر همدان: آقای یونسی</span>
										</span>
										<div className="flex items-center">
											<span>۰۹۱۸۳۱۴۰۴۱۳</span>
											<span>
												<svg
													id="Layer_1_1_"
													// style="enable-background: new 0 0 16 16"
													height="15"
													width="15"
													version="1.1"
													viewBox="0 0 16 16"
													// xml:space="preserve"
													xmlns="http://www.w3.org/2000/svg"
													// xmlns:xlink="http://www.w3.org/1999/xlink"
												>
													<path d="M5,16h6c1.105,0,2-0.895,2-2V2c0-1.105-0.895-2-2-2H5C3.895,0,3,0.895,3,2v12C3,15.105,3.895,16,5,16z M4,2h8v12H4V2z" />
												</svg>
											</span>
										</div>
									</div>
								</div>
								<div className="h-12 w-12 bg-gray-100"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export function getDatesIngregorian(date: string): string {
	return moment(date, "MM-DD-YYYY").locale("fa").format("jYYYY/jMM/jDD");
}
