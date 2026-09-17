"use client";

import { addCommas } from "persian-tools";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import PostNewProductsTransfer from "@/api/products/postNewProductsTransfer";
import PutProductsQuantity from "@/api/products/putProductsQuantity";
import { Button } from "@/components/ui/button";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

import FindBranch from "../modules/FindBranch";
import { Product } from "../modules/FindProduct";

interface ProductActionProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: Product;
	getCardData: () => void;
	mode: "+" | "-" | undefined;
}

type Manager = {
	id: string;
	userId: string;
	username: string;
	firstname: string;
	lastname: string;
	fullname: string;
	nationalCode: string;
	phoneNo: string;
	email: string | null;
	branchId: string;
	academics: any[];
	jobs: any[];
};

type FormAttribuiteProps = {
	branchId: {
		id: string;
		name: string;
		title: string;
		type: "group" | "branch";
		manager: Manager;
	};
	startIndex: number;
	endIndex: number;
	mode: string;
	productId: string;
	quantity: number;
	description: string;
};

export default function ProductAction({
	isShow,
	setShow,
	data,
	getCardData,
	mode,
}: ProductActionProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [formAttribute, setFormAttribute] = useState<FormAttribuiteProps>();

	async function productAction() {
		setLoading(true);
		try {
			if (!formAttribute?.mode) {
				toast.warning("لطفا حالت تغییر را مشخص کنید!");
			} else if (!formAttribute?.productId) {
				toast.warning("لطفا نام محصول را وارد کنید!");
			} else if (formAttribute?.mode === "-" && !formAttribute?.branchId) {
				toast.warning("لطفا نام شعبه را وارد کنید!");
			} else if (
				formAttribute?.mode === "-" &&
				(!formAttribute?.quantity || formAttribute?.quantity == 0)
			) {
				toast.warning("لطفا مقدار را وارد کنید!");
			} else {
				if (formAttribute?.mode === "-") {
					let response = await PostNewProductsTransfer({
						branchId: formAttribute?.branchId.id,
						id: formAttribute?.productId,
						qty: +formAttribute?.quantity,
						description: formAttribute.description,
					});
					if (response) {
						setTimeout(() => {
							toast.success("با موفقیت انتقال یافت!");
							getCardData();
							setLoading(false);
							setShow(false);
						}, 300);
					}
				} else if (formAttribute?.mode === "+") {
					let response = await PutProductsQuantity({
						id: formAttribute?.productId,
						endIndex: formAttribute?.endIndex,
						startIndex: formAttribute?.startIndex,
					});
					if (response) {
						setTimeout(() => {
							toast.success("با موفقیت انتقال یافت!");
							getCardData();
							setLoading(false);
							setShow(false);
						}, 300);
					}
				}
			}
		} catch (error: any) {
			error.response.data.message === "product not exist or out of quantity"
				? toast.error("موجودی کافی نیست!")
				: toast.error("خطایی رخ داد!");
			setLoading(false);
		}
		setLoading(false);
	}

	useEffect(() => {
		if (data) {
			setFormAttribute((prev: any) => ({
				...prev,
				productId: data.id,
			}));
		}
		if (mode) {
			setFormAttribute((prev: any) => ({
				...prev,
				mode: mode,
			}));
		}
	}, [data]);

	return (
		<>
			{
				<MyModal
					size="2xl"
					title="افزودن محصول"
					content={
						<>
							<div className="mt-6 flex flex-col">
								<div className="col-span-9 col-start-1 mb-[1rem] flex flex-col rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1">
									<div className="relative flex flex-col pt-[1rem]">
										<select
											onChange={(event) =>
												setFormAttribute((prev: any) => ({
													...prev,
													mode: event.target.value,
												}))
											}
											defaultValue={"undefined"}
											value={formAttribute?.mode}
											className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
										>
											<option value={"undefined"} selected disabled>
												انتخاب
											</option>
											<option value={"+"} selected>
												ورود
											</option>
											<option value={"-"}>خروج</option>
										</select>
									</div>

									{formAttribute?.mode === "-" && (
										<>
											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												تعداد
											</label>
											<input
												onChange={(event) =>
													setFormAttribute((prev: any) => ({
														...prev,
														quantity: event.target.value.replace(
															/[^\d.-]+/g,
															"",
														),
													}))
												}
												value={
													formAttribute?.quantity &&
													addCommas(+formAttribute?.quantity?.toLocaleString())
												}
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"تعداد"}
											/>

											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												استفاده کننده
											</label>
											<FindBranch
												key={"branchName"}
												setBranch={(value) =>
													setFormAttribute((prev: any) => ({
														...prev,
														branchId: value,
													}))
												}
												branch={formAttribute?.branchId}
											/>

											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												توضیحات
											</label>
											<textarea
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												value={formAttribute?.description || ""}
												onChange={(event) =>
													setFormAttribute((prev: any) => ({
														...prev,
														description: event.target.value,
													}))
												}
											/>
										</>
									)}

									{formAttribute?.mode === "+" && (
										<>
											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												شروع از
											</label>
											<input
												onChange={(event) =>
													setFormAttribute((prev: any) => ({
														...prev,
														startIndex:
															+event.target.value > 0 ? +event.target.value : 1,
													}))
												}
												value={formAttribute?.startIndex}
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"عدد"}
											/>
											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												تا
											</label>
											<input
												onChange={(event) =>
													setFormAttribute((prev: any) => ({
														...prev,
														endIndex:
															+event.target.value > 0 ? +event.target.value : 1,
													}))
												}
												value={formAttribute?.endIndex}
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"عدد"}
											/>
										</>
									)}

									<Button className="m-4" onClick={() => productAction()}>
										{loading ? (
											<Loading className="flex justify-center" size={"sm"} />
										) : (
											"ثبت"
										)}
									</Button>
								</div>
							</div>
						</>
					}
					name="uploadExel"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
