"use client";

import { FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/identity/users/models/User";

function CourseParticipantsTableRow({
	participant,
	index,
	onDelete,
}: {
	participant: User;
	index: number;
	onDelete: (participant: User) => void;
}) {
	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>{participant.fullname}</TableCell>
			<TableCell className="tracking-wide">
				{participant.nationalCode || "-"}
			</TableCell>
			<TableCell className="tracking-wide">
				{participant.phoneNo || "-"}
			</TableCell>
			<TableCell>{participant.email || "-"}</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<Tooltip>
							<TableAction>
								<TooltipTrigger asChild>
									<Button
										className="h-full focus-within:text-red-600 hover:text-red-600 active:text-red-700"
										size="icon"
										variant="ghost"
										onClick={() => {
											onDelete(participant);
										}}
									>
										<FaTrash />
									</Button>
								</TooltipTrigger>
								<TooltipContent>حذف شرکت کننده</TooltipContent>
							</TableAction>
						</Tooltip>
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

export { CourseParticipantsTableRow };
