import { useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { toast } from "sonner";

import DeleteProjectLabel from "@/api/tasks-manager/deleteProjectLabel";
import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import PostProjectsTasksLabel from "@/api/tasks-manager/postProjectsTasksLabel";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagination/Pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

interface ProjectLabelsProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	getData: () => void;
	data?: any;
}

export default function ProjectLabels({
	isShow,
	setShow,
	getData,
	data,
}: ProjectLabelsProps) {
	const [loading, setLoading] = useState<boolean>(true);

	const { identity } = useLoggedInUser();
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [labels, setLabels] = useState<any>();
	const [newLabels, setNewLabels] = useState<any>();

	async function getProjectLabel() {
		setLoading(true);
		let res;
		try {
			res = GetAllProjectsTasksLabels({
				page: currentPage,
				size: size,
			});
			res.then((res) => {
				setLabels(res.result?.data);
				setItems(res.result?.count);
				setLoading(false);
			});
		} catch (err) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	async function postNewLabel() {
		setLoading(true);
		let res;
		try {
			res = PostProjectsTasksLabel({
				title: newLabels,
			});
			res.then((res) => {
				getProjectLabel();
				setNewLabels("");
				setLoading(false);
			});
		} catch (err) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	async function deleteLabel(id: string) {
		setLoading(true);
		let res;
		try {
			res = DeleteProjectLabel({
				id,
			});
			res.then((res) => {
				getProjectLabel();
				setLoading(false);
			});
		} catch (err) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	useEffect(() => {
		getProjectLabel();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [size, currentPage]);

	return (
		<>
			{
				<MyModal
					size={"4xl"}
					title={`برچسب ها`}
					content={
						<>
							{loading ? (
								<Loading />
							) : (
								<div
									className={`"justify-center" mt-6 flex max-h-[30rem] w-full flex-col overflow-y-auto`}
								>
									<Table>
										<TableHeader className="bg-gray-100">
											<TableRow>
												<TableHead className="px-2 text-right">ردیف</TableHead>
												<TableHead className="px-2 text-right">عنوان</TableHead>
												<TableHead className="px-2 text-right"></TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{labels?.length ? (
												labels?.map((label: any, index: number) => (
													<TableRow key={label?.id}>
														<TableCell>{index + 1}</TableCell>
														<TableCell>{label?.title ?? "-"}</TableCell>
														<TableCell className="text-left">
															{identity?.groups?.includes("admins") && (
																<>
																	<button
																		onClick={() => deleteLabel(label?.id)}
																		className="flex-inline btn mx-[.5rem] items-center rounded bg-gray-100 px-1 py-1 text-black hover:text-red-500"
																	>
																		<BsFillTrashFill size={13} />
																	</button>
																</>
															)}
														</TableCell>
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell colSpan={10}> موردی یافت نشد...</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
									<Pagination
										items={items}
										currentPage={currentPage}
										size={size}
										onPageChange={setCurrentPage}
										loading={loading}
										setSize={setSize}
									/>
									<div className="mt-10 flex self-end">
										<Input
											disabled={loading}
											className="mx-2 max-w-44"
											placeholder="برچسب"
											onChange={(e) => setNewLabels(e.target.value)}
											value={newLabels}
										/>
										<Button
											disabled={loading}
											onClick={() =>
												newLabels?.length
													? postNewLabel()
													: toast.error("عنوان برچسب را وارد کنید!")
											}
										>
											ثبت
										</Button>
									</div>
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
