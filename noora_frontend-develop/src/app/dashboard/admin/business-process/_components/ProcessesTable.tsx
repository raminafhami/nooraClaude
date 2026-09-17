import { FaEye } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Process } from "@/felo/processes/models/Process";
import { processGroup } from "@/felo/processes/models/ProcessGroup";

type Item = Process & { category: string };

export const ProcessesTable = ({
	items,
	loading,
}: {
	items: Item[];
	loading: boolean;
}) => {
	return (
		<Table
			loading={loading}
			slotProps={{ root: { className: "border-x-0 rounded-none" } }}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-20">ردیف</TableHead>
					<TableHead>عنوان</TableHead>
					<TableHead>نسخه</TableHead>
					<TableHead>دسته بندی</TableHead>
					<TableHead className="w-1">عملیات</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{items.length > 0 ? (
					items.map((process: Item, index: number) => (
						<TableRow key={process.id}>
							<TableCell>{index + 1}</TableCell>
							<TableCell>
								<DynamicLink
									href={`/dashboard/admin/business-process/${process.key}`}
								>
									{process.name}
								</DynamicLink>
							</TableCell>
							<TableCell>{process.version}</TableCell>
							<TableCell>{processGroup[process.category]?.title}</TableCell>
							<TableCell>
								<TooltipProvider>
									<TableActions>
										<Tooltip>
											<TableAction>
												<TooltipTrigger asChild>
													<Button size="icon" variant="link" asChild>
														<DynamicLink
															href={`/dashboard/admin/business-process/${process.key}`}
														>
															<FaEye />
														</DynamicLink>
													</Button>
												</TooltipTrigger>
												<TooltipContent>مشاهده فرایند</TooltipContent>
											</TableAction>
										</Tooltip>
									</TableActions>
								</TooltipProvider>
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
};
