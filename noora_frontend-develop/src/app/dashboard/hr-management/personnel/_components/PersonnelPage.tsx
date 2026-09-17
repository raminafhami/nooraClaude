"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Input } from "@/form/Input";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelQueryFilter } from "@/hrm/personnel/models/PersonnelQuery";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";

import { PersonnelTable } from "./PersonnelTable";

const PersonnelCreateDialog = dynamic(
	() =>
		import("@/hrm/personnel/components/personnel-create/PersonnelCreateDialog"),
);

function PersonnelPage() {
	const dialog = useDialogs();

	const { identity, isAuthorized } = useLoggedInUser();

	const canSeeAll = isAuthorized({ groups: ["ceo", "hr-manager"] });

	const [searchValue, setSearchValue] = useState<string>("");

	const personnelQueryFn = useCallback(
		async (page: number, pageSize: number): Promise<[Personnel[], number]> => {
			const filters: PersonnelQueryFilter[] = [];

			const userFilter: any = {};

			if (!canSeeAll) {
				userFilter.branchId = identity.branchId;
			}

			if (searchValue) {
				userFilter.$or = [
					{
						$expr: {
							$regexMatch: {
								input: {
									$concat: ["$name", " ", "$lastname"],
								},
								regex: searchValue,
								options: "i",
							},
						},
					},
					{ email: { $regex: searchValue } },
					{ phoneNo: { $regex: searchValue } },
					{ nationalCode: { $regex: searchValue } },
				];
			}

			filters.push({
				name: "user",
				value: userFilter,
			});

			const personnel = await getPersonnel({
				filters,
				populate: ["user", "jobs"],
				page: { no: page, size: pageSize },
			});

			return [personnel.items, personnel.total];
		},
		[identity, canSeeAll, searchValue],
	);

	const {
		items: personnel,
		isLoading,
		error,
		offset,
		Pagination,
		refetch: refetchPersonnel,
	} = usePagination<Personnel>(personnelQueryFn);

	const handleCreateDialogOpen = useCallback(async () => {
		const result = await dialog.open(PersonnelCreateDialog);

		if (result) {
			refetchPersonnel();
		}
	}, [dialog, refetchPersonnel]);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست پرسنل</CardTitle>
				<CardNav>
					<Input
						className="ms-auto w-56"
						placeholder="جستجوی نام، کد ملی و شماره همراه"
						value={searchValue}
						onChange={(e) =>
							setSearchValue(
								e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
							)
						}
					/>

					<Button variant="primary" onClick={handleCreateDialogOpen}>
						<FaPlus />
						<span>افزودن پرسنل جدید</span>
					</Button>
				</CardNav>
			</CardHeader>

			<CardContent className="px-0">
				<PersonnelTable
					personnel={personnel}
					error={error}
					loading={isLoading}
					offset={offset}
					Pagination={<Pagination />}
				/>
			</CardContent>
		</Card>
	);
}

export { PersonnelPage };
