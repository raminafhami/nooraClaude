"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MdLabel } from "react-icons/md";
import { toast } from "sonner";

import GetAllProjects from "@/api/tasks-manager/getAllProjects";
import { useTableData } from "@/cache/tableHook";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";
import { Layout } from "@/ui/Layout";

import AddNewProject from "./_components/modal/AddNewProject";
import ProjectLabels from "./_components/modal/ProjectLabels";
import { TasksList } from "./_components/TasksList";

export default function TasksListPage() {
	const [projects, setProjects] = useState<any>([]);
	const { currentPage, setCurrentPage, size, setSize } = useTableData({
		tableName: "TaskManagerTable",
		initialPage: 0,
		initialSize: 10,
		initialFilters: undefined,
		data: projects,
	});
	const [items, setItems] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [isModal, setIsModal] = useState<boolean>(false);
	const [isLabelModal, setIsLabelModal] = useState<boolean>(false);

	const getAllProjects = useCallback(async () => {
		setLoading(true);
		try {
			let res: any = await GetAllProjects({
				page: currentPage,
				size: size,
			});
			if (res) {
				setProjects(res.result.data);
				setItems(res.result.count);
				setLoading(false);
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}, [currentPage, size]);

	useEffect(() => {
		getAllProjects();
	}, [getAllProjects]);

	return (
		<>
			{isModal && (
				<AddNewProject
					key={"addProduct"}
					isShow={isModal}
					setShow={setIsModal}
					getData={getAllProjects}
				/>
			)}

			{isLabelModal && (
				<ProjectLabels
					key={"Labels"}
					isShow={isLabelModal}
					setShow={setIsLabelModal}
					getData={getAllProjects}
				/>
			)}

			<Layout.Root>
				<Layout.Head title="لیست پروژه ها">
					<div className="flex gap-x-3">
						<Button type="button" onClick={() => setIsModal(true)}>
							<FaPlus size={10} />
							<span className="ms-1">افزودن پروژه</span>
						</Button>

						<Button type="button" onClick={() => setIsLabelModal(true)}>
							<MdLabel size={15} />
							<span className="ms-1">برچسب ها</span>
						</Button>
					</div>
				</Layout.Head>
				<Layout.Content>
					<TasksList
						loading={loading}
						projects={projects}
						getData={getAllProjects}
						setLoading={setLoading}
					/>

					<Pagination
						items={items}
						currentPage={currentPage}
						size={size}
						onPageChange={setCurrentPage}
						loading={loading}
						setSize={setSize}
					/>
				</Layout.Content>
			</Layout.Root>
		</>
	);
}
