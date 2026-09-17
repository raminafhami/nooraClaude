"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import { Property } from "@/property/models/Property";
import deleteProperty from "@/property/services/deleteProperty";
import { getProperty } from "@/property/services/getProperty";

import { PropertyTable } from "./PropertyTable";

const PropertyEditDialog = dynamic(
	() => import("../modals/PropertyUpsertDialog"),
);

const PropertyFilesDialog = dynamic(
	() => import("../modals/PropertyFilesDialog"),
);

const PropertyAssignToUserDialog = dynamic(
	() => import("../modals/PropertyAssignToUserDialog"),
);

const PropertyUnassignDialog = dynamic(
	() => import("../modals/PropertyUnassignDialog"),
);

const PropertyRepairDialog = dynamic(
	() => import("../modals/PropertyRepairDialog"),
);

const PropertyDecommissionDialog = dynamic(
	() => import("../modals/PropertyDecommissionDialog"),
);

const PropertyList = ({
	shouldRefetch,
}: {
	shouldRefetch: boolean | undefined;
}) => {
	const dialogs = useDialogs();

	// search
	const [searchNameParam, setSearchNameParam] = useState<string>("");
	const [searchAssignmentParam, setSearchAssignmentParam] =
		useState<UserLookup>();

	// data
	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const filters: Record<string, any> = {};

			if (searchNameParam) {
				filters.type = searchNameParam;
			}
			if (searchAssignmentParam) {
				filters.assignedUser = searchAssignmentParam.id;
			}

			const res = await getProperty({
				pagination: { page, pageSize },
				populate: ["assignmentHistoryUsers"],
				filters: Object.keys(filters).length ? filters : undefined,
			});

			return [res.items, res.total] as const;
		},
		[searchNameParam, searchAssignmentParam],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	useEffect(() => {
		if (typeof shouldRefetch !== "undefined") {
			refetch();
		}
	}, [shouldRefetch, refetch]);

	// dialogs
	const handlePropertyEditDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(PropertyEditDialog, {
				property,
			});
			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handlePropertyFilesDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(PropertyFilesDialog, {
				id: property.id,
			});
			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handlePropertyAssignToUserDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(PropertyAssignToUserDialog, {
				property,
			});
			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handlePropertyUnassignDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(PropertyUnassignDialog, {
				id: property.id,
			});
			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	// نگهداری کالا
	// const handlePropertyMaintenanceDialogOpen = useCallback(
	// 	(id: string, maintenanceHistory: maintenanceHistory[] | null) => {
	// 		dialogs.open(PropertyMaintenanceDialog, {
	// 			id,
	// 			maintenanceHistory,
	// 			refetch,
	// 		});
	// 	},
	// 	[dialogs],
	// );

	const handlePropertyRepairDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(PropertyRepairDialog, {
				id: property.id,
				repairHistory: property.repairHistory,
			});
			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handleDecommissionDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(PropertyDecommissionDialog, {
				id: property.id,
			});
			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handlePropertyDeleteDialogOpen = useCallback(
		async (property: Property) => {
			const result = await dialogs.open(DeleteDialog, {
				title: property.type,
				onSubmit: async () => {
					await deleteProperty({ id: property.id });
					toast.success("کالا با موفقیت حذف شد");
				},
				onError: () => {
					toast.error("خطا در حذف کالا");
				},
			});

			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	return (
		<div className="w-full">
			<Card className="border shadow-sm">
				<CardHeader orientation="horizontal">
					<CardTitle>فهرست اموال</CardTitle>
					<CardNav>
						<Input
							className="w-56"
							placeholder="جستجوی نام کالا"
							onChange={(e) => setSearchNameParam(e.target.value)}
						/>
						<div className="w-56">
							<UserLookupSelect
								placeholder="جستجوی کاربر"
								type={UserType.Personnel}
								onValueChange={(e: any) => {
									setSearchAssignmentParam(e);
								}}
								value={searchAssignmentParam}
							/>
						</div>
					</CardNav>
				</CardHeader>

				<CardContent className="px-0">
					<PropertyTable
						items={items}
						isLoading={isLoading}
						offset={offset}
						pagination={<Pagination />}
						onItemView={handlePropertyEditDialogOpen}
						onItemEdit={handlePropertyEditDialogOpen}
						onItemFiles={handlePropertyFilesDialogOpen}
						onItemAssignToUser={handlePropertyAssignToUserDialogOpen}
						onItemUnassignUser={handlePropertyUnassignDialogOpen}
						onItemRepair={handlePropertyRepairDialogOpen}
						onItemDecomission={handleDecommissionDialogOpen}
						onItemDelete={handlePropertyDeleteDialogOpen}
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export { PropertyList };
