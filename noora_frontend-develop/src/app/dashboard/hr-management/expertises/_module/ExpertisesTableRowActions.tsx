"use client";

import { useMemo } from "react";
import { FaPencil, FaTrash } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { TableAction, TableActions } from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Expertise } from "@/hrm/expertises/models/Expertise";

function ExpertisesTableRowActions({
	expertise,
	onEdit,
	onDelete,
}: {
	expertise: Expertise;
	onEdit: (expertise: Expertise) => void;
	onDelete: (expertise: Expertise) => void;
}) {
	const { isAuthorized } = useLoggedInUser();

	const canDelete = useMemo(() => isAuthorized({ groups: [] }), [isAuthorized]);

	return (
		<TooltipProvider>
			<TableActions>
				<Tooltip>
					<TableAction
						className="focus-within:text-yellow-500 hover:text-yellow-500 active:text-yellow-500"
						onClick={() => onEdit(expertise)}
					>
						<TooltipTrigger asChild>
							<Button size="icon" variant="link">
								<FaPencil />
							</Button>
						</TooltipTrigger>
						<TooltipContent>ویرایش توانمندی</TooltipContent>
					</TableAction>
				</Tooltip>

				{canDelete && (
					<Tooltip>
						<TableAction
							className="focus-within:text-red-500 hover:text-red-500 active:text-red-500"
							onClick={() => onDelete(expertise)}
						>
							<TooltipTrigger asChild>
								<Button size="icon" variant="link">
									<FaTrash />
								</Button>
							</TooltipTrigger>
							<TooltipContent>حذف توانمندی</TooltipContent>
						</TableAction>
					</Tooltip>
				)}
			</TableActions>
		</TooltipProvider>
	);
}

export { ExpertisesTableRowActions };
