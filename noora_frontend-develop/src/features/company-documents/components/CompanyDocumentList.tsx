"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useDebounce } from "use-debounce";

import { CompanyDocument } from "@/company-documents/models/CompanyDocument";
import { getCompanyDocuments } from "@/company-documents/services/getCompanyDocuments";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/components/ui/pagination/usePagination";

import { CompanyDocumentQueryFilter } from "../models/CompanyDocumentQuery";
import { CompanyDocumentTable } from "./CompanyDocumentTable";

const CompanyDocumentCreateDialog = dynamic(
	() => import("./modal/CompanyDocumentCreateDialog"),
);

function CompanyDocumentList() {
	const dialogs = useDialogs();

	const [searchTerm, setSearchValue] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			const filters: CompanyDocumentQueryFilter = {};

			if (debouncedSearchTerm) {
				filters.$or = [
					{ title: { $regex: debouncedSearchTerm } },
					{ description: { $regex: debouncedSearchTerm } },
				];
			}

			const documents = await getCompanyDocuments({
				filters,
				pagination: { page, pageSize },
			});

			return [documents.items, documents.total] as const;
		},
		[debouncedSearchTerm],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination<CompanyDocument>(fetchData);

	const handleDocumentCreateDialog = useCallback(async () => {
		const result = await dialogs.open(CompanyDocumentCreateDialog);

		if (result) {
			refetch();
		}
	}, [dialogs, refetch]);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست مدارک شرکت</CardTitle>
				<CardNav>
					<Input
						className="w-56"
						placeholder="جستجو"
						onChange={(e) => setSearchValue(e.target.value)}
					/>

					<Button variant="primary" onClick={handleDocumentCreateDialog}>
						<FaPlus />
						<span>افزودن مدرک جدید</span>
					</Button>
				</CardNav>
			</CardHeader>

			<CardContent className="px-0">
				<CompanyDocumentTable
					documents={items}
					loading={isLoading}
					offset={offset}
					pagination={<Pagination />}
					refetch={refetch}
				/>
			</CardContent>
		</Card>
	);
}

export { CompanyDocumentList };
