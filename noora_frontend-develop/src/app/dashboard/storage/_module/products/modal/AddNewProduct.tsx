import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import GetAllProductById from "@/api/products/getAllProductById";
import GetAllProductsCategory from "@/api/products/getAllProductsCategory";
import PostNewProducts from "@/api/products/postNewProducts";
import PutNewProducts from "@/api/products/putNewProducts";
import { useTableStore } from "@/cache/store/tableStore";
import { Button } from "@/components/ui/button";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface AddNewProductProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	getData: () => void;
	isEdit?: any;
}

interface FormAttribuiteProps {
	name?: string;
	categoryId?: string;
	endIndex?: number;
	startIndex?: number;
	firstCount?: string;
	SecondCount?: string;
	alertThreshold?: number;
	quCount?: number | undefined;
}

export default function AddNewProduct({
	isShow,
	setShow,
	getData,
	isEdit,
}: AddNewProductProps) {
	const { setTableData, getTableData } = useTableStore();

	const [loading, setLoading] = useState<boolean>(false);
	const [category, setCategories] = useState<any>();
	const [product, setProduct] = useState<any>();
	const [formAttribuite, setFormAttribuite] = useState<FormAttribuiteProps>();

	async function sendProducts() {
		setLoading(true);
		try {
			if (!formAttribuite?.name) {
				return handleInvalidForm("نام را وارد کنید!");
			} else if (!formAttribuite?.categoryId) {
				return handleInvalidForm("دسته بندی را وارد کنید!");
			} else {
				if (isEdit) {
					const res = await PutNewProducts({
						name: formAttribuite?.name,
						categoryId: formAttribuite?.categoryId,
						id: isEdit,
						alertThreshold: formAttribuite?.alertThreshold,
					});
					if (res) {
						toast.success("با موفقیت ویرایش شد!");
						setTimeout(() => {
							setTableData({
								tableName: "StorageTable",
								page: 0,
								size: 20,
							});
							getData();
							setLoading(false);
							setShow(false);
						}, 300);
					}
				} else {
					const res = await PostNewProducts({
						name: formAttribuite?.name,
						categoryId: formAttribuite?.categoryId,
						endIndex: formAttribuite?.endIndex as number,
						startIndex: formAttribuite?.startIndex as number,
						alertThreshold: formAttribuite?.alertThreshold,
					});
					if (res) {
						toast.success("با موفقیت ثبت شد!");
						setTimeout(() => {
							setTableData({
								tableName: "StorageTable",
								page: 0,
								size: 20,
							});
							getData();
							setLoading(false);
							setShow(false);
						}, 300);
					}
				}
			}
		} catch (e) {
			setLoading(false);
		}
		setLoading(false);
	}

	function handleInvalidForm(message: string) {
		toast.warning(message);
		setLoading(false);
	}

	async function getProduct() {
		setLoading(true);
		try {
			if (isEdit) {
				let res = GetAllProductById({ id: isEdit });
				res.then((res) => {
					if (res) {
						setProduct(res.result);
						setLoading(false);
					}
				});
			}
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
			setLoading(true);
		}
		setLoading(true);
	}

	async function getCategory() {
		try {
			let res = GetAllProductsCategory({ page: 0, size: 999 });
			res.then((res) => {
				if (res) {
					setCategories(res.result.data);
				}
			});
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
		}
	}

	useEffect(() => {
		getCategory();
		if (isEdit) {
			getProduct();
		}
	}, []);

	useEffect(() => {
		if (product) {
			setFormAttribuite((prev) => ({
				...prev,
				name: product.name,
				categoryId: product.category?.id,
				startIndex: product.startIndex,
				endIndex: product.endIndex,
				quantity: product.quantity,
				alertThreshold: product.alertThreshold || undefined,
			}));
		}
	}, [product]);

	return (
		<>
			{
				<MyModal
					size={"2xl"}
					title={`${isEdit ? "ویرایش" : "افزودن محصول"}`}
					content={
						<>
							{loading ? (
								<Loading />
							) : (
								<div className={`"justify-center" mt-6 flex w-full`}>
									<div
										className={`col-span-9 col-start-1 mb-[1rem] flex w-full flex-col rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1`}
									>
										<div className="relative flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
												دسته بندی
											</label>

											<select
												onChange={(event) =>
													setFormAttribuite((prev) => ({
														...prev,
														categoryId: event.target.value,
													}))
												}
												onKeyDown={() => null}
												className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												defaultValue={
													formAttribuite?.categoryId
														? formAttribuite?.categoryId
														: "undefined"
												}
											>
												<option
													value={"undefined"}
													disabled
													selected={formAttribuite?.categoryId ? false : true}
												>
													انتخاب
												</option>
												{category?.map((cat: any) => (
													<option
														key={cat.id}
														value={cat.id}
														selected={
															formAttribuite?.categoryId &&
															formAttribuite?.categoryId === cat.id
																? true
																: false
														}
													>
														{cat.name}
													</option>
												))}
											</select>
										</div>
										<label className="mx-[1.5rem] mt-[.5rem] select-none">
											نام
										</label>
										<input
											onChange={(event) =>
												setFormAttribuite((prev) => ({
													...prev,
													name: event.target.value,
												}))
											}
											value={formAttribuite?.name}
											className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
											placeholder={"نام"}
										/>

										{!isEdit && (
											<>
												<label className="mx-[1.5rem] mt-[.5rem] select-none">
													شروع از
												</label>
												<input
													disabled={isEdit}
													onChange={(event) =>
														setFormAttribuite((prev) => ({
															...prev,
															startIndex: +event.target.value?.replace(
																/[^\d.-]+/g,
																"",
															),
														}))
													}
													value={formAttribuite?.startIndex}
													className={`${
														isEdit && "text-gray-400"
													} group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
													placeholder={"شمارنده"}
												/>
												<label className="mx-[1.5rem] mt-[.5rem] select-none">
													تا
												</label>
												<input
													disabled={isEdit}
													onChange={(event) =>
														setFormAttribuite((prev) => ({
															...prev,
															endIndex: +event.target.value?.replace(
																/[^\d.-]+/g,
																"",
															),
														}))
													}
													value={formAttribuite?.endIndex}
													className={`${
														isEdit && "text-gray-400"
													} group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
													placeholder={"شمارنده"}
												/>
											</>
										)}
										<label className="mx-[1.5rem] mt-[.5rem] select-none">
											میزان هشدار
										</label>
										<input
											onChange={(event) => {
												setFormAttribuite((prev) => ({
													...prev,
													alertThreshold: +event.target.value,
												}));
											}}
											value={formAttribuite?.alertThreshold}
											className={`group relative mx-4 my-4 w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
										/>
										<Button className="m-4" onClick={() => sendProducts()}>
											{loading ? (
												<Loading className="flex justify-center" size={"sm"} />
											) : (
												"ثبت"
											)}
										</Button>
									</div>

									{/* {!isEdit && (
                    <div className="flex flex-col p-1 mb-[1rem] bg-gray-100 border-x-4 border-gray-200 rounded-xl col-span-9 col-start-1 mr-[1rem]">
                      <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                        از شماره
                      </label>
                      <input
                        onChange={(event) =>
                          setFormAttribuite((prev) => ({
                            ...prev,
                            firstCount: event.target.value,
                          }))
                        }
                        value={
                          formAttribuite?.firstCount &&
                          formAttribuite?.firstCount
                        }
                        className={` mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
                        placeholder={"مقدار"}
                      />
                      <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                        تا شماره
                      </label>
                      <input
                        onChange={(event) =>
                          setFormAttribuite((prev) => ({
                            ...prev,
                            SecondCount: event.target.value,
                          }))
                        }
                        value={
                          formAttribuite?.SecondCount &&
                          formAttribuite?.SecondCount
                        }
                        className={`${
                          isEdit && "text-gray-400"
                        } mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
                        placeholder={"مقدار"}
                      />
                      <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                        موجودی بدست آمده
                      </label>
                      <input
                        onClick={() =>
                          setFormAttribuite((prev) => ({
                            ...prev,
                            quantity: formAttribuite?.quCount
                              ? +formAttribuite?.quCount
                              : 0,
                          }))
                        }
                        readOnly
                        value={
                          formAttribuite?.quCount &&
                          addCommas(formAttribuite?.quCount)
                        }
                        className={` mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] !mt-[1rem] !mr-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
                        placeholder={"موجودی اولیه"}
                      />
                      <button
                        onClick={() => {
                          setFormAttribuite((prev) => ({
                            ...prev,
                            quCount:
                              formAttribuite?.firstCount &&
                              formAttribuite?.SecondCount
                                ? parseFloat(formAttribuite?.SecondCount) -
                                  parseFloat(formAttribuite?.firstCount)
                                : undefined,
                          }));
                        }}
                        className={`mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] mt-[1rem] border-2 bg-blue-500 text-white rounded-2xl group relative text-ellipsis hover:bg-blue-700 focus:border-blue-500 focus:text-black py-2 rounded focus:outline-0`}>
                        {loading ? (
                          <Loading
                            className="flex justify-center"
                            size={"sm"}
                          />
                        ) : (
                          "محاسبه"
                        )}
                      </button>
                    </div>
                  )} */}
								</div>
							)}
						</>
					}
					name="addProducts"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
