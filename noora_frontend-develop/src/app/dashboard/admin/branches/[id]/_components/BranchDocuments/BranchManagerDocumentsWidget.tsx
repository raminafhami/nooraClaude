"use client";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";

import { useBranchContext } from "../BranchContext";
import { BranchManagerDocuments } from "./BranchManagerDocuments";

export function BranchManagerDocumentsWidget(): React.ReactNode {
	const { branch } = useBranchContext();

	return (
		<div className="grid gap-x-12 gap-y-12 lg:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6">
			{branch.managerId ? (
				<>
					<div className="col-span-full">
						<div className="w-full">
							<BranchManagerDocuments />
						</div>
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
