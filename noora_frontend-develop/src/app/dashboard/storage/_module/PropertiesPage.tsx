"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { PropertyList } from "@/property/components/property-list/PropertyList";
import { Head } from "@/ui/Head";

const PropertyAddDialog = dynamic(
	() => import("@/property/components/modals/PropertyUpsertDialog"),
);

function PropertiesPage() {
	const dialogs = useDialogs();

	// data refresh
	const [shouldRefetch, setShouldRefetch] = useState<boolean>();

	const handleRefetch = useCallback(() => {
		setShouldRefetch((prev) => !prev);
	}, []);

	// dialogs
	const handlePropertyAddDialogOpen = useCallback(async () => {
		const result = await dialogs.open(PropertyAddDialog, {});
		if (result) {
			handleRefetch();
		}
	}, [dialogs, handleRefetch]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>اموال</Head.Title>
				<Head.Nav className="sm:ms-auto">
					<Button
						type="button"
						variant="primary"
						onClick={handlePropertyAddDialogOpen}
					>
						<FaPlus />
						افزودن اموال
					</Button>
				</Head.Nav>
			</Head.Root>

			<PropertyList shouldRefetch={shouldRefetch} />
		</div>
	);
}

export { PropertiesPage };
