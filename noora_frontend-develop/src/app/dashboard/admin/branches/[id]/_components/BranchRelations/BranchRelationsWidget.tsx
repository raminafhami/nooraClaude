"use client";

import { useCallback, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { LiaisonRelation } from "@/liaison-relations/models/LiaisonRelation";

import { useBranchContext } from "../BranchContext";
import { BranchRelationsForm } from "./BranchRelationsForm";
import { BranchRelationsTable } from "./BranchRelationsTable";

export function BranchRelationsWidget() {
	const { branch } = useBranchContext();

	const [selectedRelation, setSelectedRelation] =
		useState<LiaisonRelation | null>(null);
	const [selectedRelationIndex, setSelectedRelationIndex] = useState<
		number | null
	>(null);

	const handleRelationEdit = useCallback(
		(relation: LiaisonRelation | null, index: number | null) => {
			setSelectedRelation(relation);
			setSelectedRelationIndex(index);
		},
		[],
	);

	const handleRelationEditCancel = useCallback(() => {
		setSelectedRelation(null);
		setSelectedRelationIndex(null);
	}, []);

	return (
		<div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6">
			{branch.managerId ? (
				<>
					<div className="lg:col-span-1 xl:col-span-2 2xl:col-span-2">
						<div className="max-w-[25rem]">
							<BranchRelationsForm
								relation={selectedRelation}
								onEditCancel={handleRelationEditCancel}
							/>
						</div>
					</div>

					<div className="lg:col-span-full xl:col-span-full 2xl:col-span-4">
						<BranchRelationsTable
							relationInUpdate={selectedRelationIndex}
							onRelationEdit={handleRelationEdit}
						/>
					</div>
				</>
			) : (
				<div className="col-span-full">
					<DestructiveAlert className="w-fit">
						<AlertDescription>مدیر شعبه مشخص نشده است.</AlertDescription>
					</DestructiveAlert>
				</div>
			)}
		</div>
	);
}
