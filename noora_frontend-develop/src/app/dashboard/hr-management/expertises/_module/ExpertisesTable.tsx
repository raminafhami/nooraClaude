"use client";

import { ReactNode, useCallback, useState } from "react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { expertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";

import { ExpertiseDeleteDialog } from "./ExpertiseDeleteDialog";
import { ExpertisesTableRowActions } from "./ExpertisesTableRowActions";

function ExpertisesTable({
	items: expertises,
	offset,
	loading,
	pagination,
	onChange,
	onEdit,
}: {
	items: Expertise[];
	offset: number;
	loading: boolean;
	pagination: ReactNode;
	onChange: () => void;
	onEdit: (expertise: Expertise) => void;
}) {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [deleteDialogPayload, setDeleteDialogPayload] = useState<Expertise>(
		{} as Expertise,
	);

	const handleDeleteDialogOpen = useCallback((expertise: Expertise) => {
		setDeleteDialogPayload(expertise);
		setDeleteDialogOpen(true);
	}, []);

	const handleDeleteDialogClose = useCallback(
		(result?: boolean) => {
			setDeleteDialogOpen(false);
			if (result) onChange();
		},
		[onChange],
	);

	return (
		<>
			<Table
				loading={loading}
				pagination={pagination}
				slotProps={{ root: { className: "rounded-none border-x-0" } }}
			>
				<TableHeader>
					<TableRow className="whitespace-nowrap">
						<TableHead className="w-1">#</TableHead>
						<TableHead>عنوان</TableHead>
						<TableHead className="w-44">نوع</TableHead>
						<TableHead className="w-1">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{expertises.length ? (
						expertises.map((expertise, index) => (
							<TableRow key={expertise.id} className="whitespace-nowrap">
								<TableCell>{offset + index + 1}</TableCell>
								<TableCell>{expertise.title}</TableCell>
								<TableCell>{expertiseType[expertise.type].title}</TableCell>
								<TableCell>
									<ExpertisesTableRowActions
										expertise={expertise}
										onEdit={onEdit}
										onDelete={handleDeleteDialogOpen}
									/>
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

			<ExpertiseDeleteDialog
				payload={deleteDialogPayload}
				open={deleteDialogOpen}
				onClose={handleDeleteDialogClose}
			/>
		</>
	);
}

export { ExpertisesTable };
