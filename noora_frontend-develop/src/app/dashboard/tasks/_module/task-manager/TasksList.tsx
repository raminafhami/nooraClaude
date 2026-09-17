"use client";

import { useRouter } from "next/navigation";
import { FiEdit } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface TasksListProps {
	tasks: any;
	loading: boolean;
}

export function TasksList({ tasks, loading }: TasksListProps) {
	const router = useRouter();

	return (
		<Panel.Root>
			<Table.Root>
				<Table.Head>
					<Table.Row className="select-none bg-gray-100 text-right">
						<Table.Cell as="th">ردیف</Table.Cell>
						<Table.Cell as="th">پروژه</Table.Cell>
						<Table.Cell as="th">نام</Table.Cell>
						<Table.Cell as="th">توضیحات</Table.Cell>
						<Table.Cell as="th">برچسب ها</Table.Cell>
						<Table.Cell as="th"></Table.Cell>
					</Table.Row>
				</Table.Head>

				<Table.Body>
					{loading ? (
						<Table.Row>
							<Table.Cell>
								<Loading size={"sm"}>در حال بارگزاری...</Loading>
							</Table.Cell>
						</Table.Row>
					) : tasks?.length ? (
						tasks.map((task: any, index: number) => (
							<Table.Row key={index}>
								<Table.Cell as="td">{index + 1}</Table.Cell>
								<Table.Cell className="max-w-32">
									<Badge className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
										<p className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
											{task?.project?.name ? task.project?.name : "-"}
										</p>
									</Badge>
								</Table.Cell>
								<Table.Cell
									as="td"
									className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
								>
									{task?.title ? task.title : "-"}
								</Table.Cell>
								<Table.Cell
									as="td"
									className="max-w-80 overflow-hidden text-ellipsis whitespace-nowrap"
								>
									{task?.description ? task.description : "-"}
								</Table.Cell>
								<Table.Cell>
									{task?.labels?.length ? (
										<ul>
											{task.labels?.map((label: any, i: number) => (
												<li className="list-disc" key={label?.i}>
													{label?.title}
												</li>
											))}
										</ul>
									) : (
										"-"
									)}
								</Table.Cell>
								<Table.Cell as="td">
									{task?.project && (
										<button
											onClick={() => {
												router.push(
													getDynamicUrl(
														`/dashboard/tasks-list/${task.project?.id}`,
													),
												);
											}}
											className="flex-inline btn items-center rounded bg-gray-100 px-1 py-1 text-black hover:bg-blue-400 hover:text-white"
										>
											<FiEdit size={13} />
										</button>
									)}
								</Table.Cell>
							</Table.Row>
						))
					) : (
						""
					)}
					{!loading && (!tasks || tasks?.length === 0) && (
						<Table.Row>
							<Table.Cell>موردی یافت نشد...</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table.Root>
		</Panel.Root>
	);
}
