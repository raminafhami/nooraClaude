import { useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

import DeleteProductCategoryById from "@/api/products/deleteProductCategoryById";
import GetAllProductsCategory from "@/api/products/getAllProductsCategory";
import PostNewProductsCategory from "@/api/products/postNewProductsCategory";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

interface AddNewCategoryProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
}

export default function AddNewCategory({
	isShow,
	setShow,
}: AddNewCategoryProps) {
	const [loading, setLoading] = useState<boolean>(true);
	const [categoryName, setCategoryName] = useState<string>();
	const [category, setCategories] = useState<any>([]);
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);

	async function sendCategory() {
		setLoading(true);
		try {
			if (!categoryName) {
				toast.warning("نام دسته بندی را وارد کنید!");
				setLoading(false);
			} else {
				let res = PostNewProductsCategory({ name: categoryName });
				res.then((res) => {
					if (res) {
						toast.success("دسته بندی جدید با موفقیت اضافه شد!");
						setTimeout(() => {
							setLoading(false);
							setShow(false);
						}, 300);
					}
				});
			}
		} catch (e) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
	}

	async function getCategory() {
		setLoading(true);
		try {
			let res = GetAllProductsCategory({ page: currentPage, size: size });
			res.then((res) => {
				if (res) {
					setTimeout(() => {
						setCategories(res.result.data);
						setItems(res.result.count);
						setLoading(false);
					}, 300);
				}
			});
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
			setLoading(false);
		}
	}

	async function removeCategory(id: string) {
		setLoading(true);
		try {
			let res = await DeleteProductCategoryById({ id });
			if (res) {
				setTimeout(() => {
					toast.success("دسته بندی با موفقیت حذف شد!");
					getCategory();
					setLoading(false);
				}, 500);
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	useEffect(() => {
		getCategory();
	}, [currentPage]);

	return (
		<>
			{
				<MyModal
					loading={loading}
					size="2xl"
					title="افزودن دسته بندی"
					content={
						<>
							<div className="mt-6 flex flex-col">
								<Layout.Content className="mb-10 w-full select-none p-0">
									<Panel.Root>
										<Panel.Container className="max-h-[16rem] overflow-y-scroll">
											<Table.Root>
												<Table.Head>
													{!category ? null : (
														<Table.Row className="select-none bg-gray-100 text-right">
															<Table.Cell as="th">ردیف</Table.Cell>
															<Table.Cell as="th">نام</Table.Cell>
															<Table.Cell as="th"></Table.Cell>
														</Table.Row>
													)}
												</Table.Head>
												<Table.Body>
													{!category ? (
														<Table.Row>
															<Table.Cell>کاربری یافت نشد...</Table.Cell>
														</Table.Row>
													) : (
														category.map((group: any, index: any) => (
															<Table.Row key={group.id}>
																{loading ? (
																	<Loading />
																) : (
																	<>
																		<Table.Cell as="td">{++index}</Table.Cell>
																		<Table.Cell as="td">
																			{group.name} {group.lastname}
																		</Table.Cell>
																		<Table.Cell>
																			<BsFillTrashFill
																				size={17}
																				className={`mr-2 inline cursor-pointer text-red-500 focus:outline-0`}
																				onClick={() => removeCategory(group.id)}
																			/>
																		</Table.Cell>
																	</>
																)}
															</Table.Row>
														))
													)}
												</Table.Body>
											</Table.Root>
										</Panel.Container>
									</Panel.Root>
								</Layout.Content>

								<Pagination
									className="mb-10"
									items={items}
									currentPage={currentPage}
									size={size}
									onPageChange={setCurrentPage}
									loading={loading}
									setSize={setSize}
								/>

								<div className="col-span-9 col-start-1 flex items-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1 py-[2rem]">
									<input
										onChange={(event) => setCategoryName(event.target.value)}
										className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
										placeholder={"نام"}
									/>
									<Button
										disabled={loading}
										type="button"
										onClick={() => !loading && sendCategory()}
									>
										{loading ? (
											<Loading className="item-center flex" size={"sm"} />
										) : (
											<>
												<FaPlus size={10} className="ml-1" /> ثبت
											</>
										)}
									</Button>
								</div>
							</div>
						</>
					}
					name="addCategory"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
