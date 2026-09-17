import moment from "jalali-moment";
import { FaAngleDown, FaAnglesUp, FaBars } from "react-icons/fa6";
import { HiDotsHorizontal } from "react-icons/hi";
import { TbProgressCheck, TbProgressHelp } from "react-icons/tb";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SelectSeparator } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserApi } from "@/identity/users/models/User";
import { ProjectTask } from "@/projects/models/ProjectTask";
import { extractProjectTaskLabels } from "@/projects/utils/extractProjectTaskLabels";
import { getProjectTaskNo } from "@/projects/utils/getProjectTaskNo";

type ColumnStatus = {
	id: string;
	name: string;
	order: number;
};
interface TaskCardProps {
	task: ProjectTask;
	columnId: string;
	hiddenCol: string;
	onClick: () => void;
	onProgressUpdate: () => void;
	onStatusUpdate: (statusId: string) => void;
	statuses: ColumnStatus[];
	assignee: UserApi | undefined;
}

const TaskCard = ({
	task,
	columnId,
	hiddenCol,
	onClick,
	onProgressUpdate,
	onStatusUpdate,
	statuses,
	assignee,
}: TaskCardProps) => {
	return (
		<Card
			className={`relative my-2 ${
				hiddenCol === columnId ? "hidden" : ""
			} fade-in hover:bg-gray-100`}
		>
			<div className="flex w-full justify-between">
				<DropdownMenu>
					<DropdownMenuTrigger className="ms-4 mt-2 w-fit">
						<HiDotsHorizontal size={25} className="hover:text-blue-500" />
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel className="text-right">
							تغییر وضعیت به
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{statuses.map(
							(status) =>
								status.id !== task.status && (
									<DropdownMenuItem
										key={status.id}
										onSelect={() => onStatusUpdate(status.id)}
									>
										{status.name}
									</DropdownMenuItem>
								),
						)}
					</DropdownMenuContent>
				</DropdownMenu>
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger>
							<div className="ml-4 mt-2">
								<div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-blue-400 p-1 font-bold text-white md:h-11 md:w-11">
									{assignee?.name?.[0]} {assignee?.lastname?.[0]}
								</div>
							</div>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								{assignee?.name} {assignee?.lastname}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<CardHeader
				onClick={onClick}
				className="relative flex cursor-pointer flex-row items-center justify-between p-2 text-right hover:text-blue-400"
			>
				<p
					className={`line-clamp-1 max-h-9 w-fit max-w-[11rem] overflow-hidden text-ellipsis font-bold ${
						task?.progress === 100 ? "line-through" : ""
					}`}
				>
					{task.priority ? (
						task?.priority === 3 ? (
							<FaAnglesUp className="inline text-red-500" size={15} />
						) : task?.priority === 2 ? (
							<FaBars className="inline text-yellow-600" size={15} />
						) : task?.priority === 1 ? (
							<FaAngleDown className="inline text-green-600" size={15} />
						) : (
							""
						)
					) : (
						"-"
					)}{" "}
					{getProjectTaskNo(task.taskNo)}. {task?.title}
				</p>
			</CardHeader>
			<CardContent
				onClick={onClick}
				className={`mb-4 ms-4 line-clamp-2 max-h-9 max-w-[15rem] cursor-pointer overflow-hidden text-ellipsis pr-2 text-right hover:text-blue-400 ${
					task?.progress === 100 ? "line-through" : ""
				}`}
			>
				{task?.description}
			</CardContent>
			<CardFooter className="flex-col items-end px-0 pb-2">
				<div className="m-1 flex w-full justify-between">
					<Badge
						variant="outline"
						className="group ms-3 cursor-pointer rounded-lg px-1 blur-none"
						onClick={onProgressUpdate}
					>
						{task?.progress === 100 ? (
							<TbProgressCheck size={17} className="text-green-600" />
						) : (
							<TbProgressHelp size={17} className="text-orange-600" />
						)}
						<p className="transition-opacity group-hover:visible group-hover:mr-2 group-hover:h-max group-hover:w-max group-hover:opacity-100">
							{task?.progress === 100 ? "شروع مجدد" : "اتمام تسک"}
						</p>
					</Badge>
					<Badge
						className={`mx-1 ${task?.progress === 100 ? "line-through" : ""} ${
							moment(task?.deadline).locale("fa").format("YYYY/MM/DD") <=
								moment(new Date()).locale("fa").format("YYYY/MM/DD") &&
							"text-red-500"
						}`}
						variant="outline"
					>
						{moment(task?.deadline).locale("fa").format("YYYY/MM/DD")}
					</Badge>
				</div>
				<SelectSeparator className="mx-6 my-2 w-5/6 bg-gray-200" />
				<div className="mx-1 flex flex-wrap justify-end">
					{extractProjectTaskLabels(task)?.map((label, index) => (
						<Badge key={index} variant="outline" className="m-1">
							{label.title}
						</Badge>
					))}
				</div>
			</CardFooter>
		</Card>
	);
};

export { TaskCard };
