"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

import GetSubContractorsProps from "@/api/subContractors/getSubContractors";
import Pagination from "@/components/ui/pagination/Pagination";
import { Layout } from "@/ui/Layout";

import AddSubcontractorModal from "./modal/AddSubcontractor";
import { SubContractors } from "./SubContractors";

export interface SearchAttributeProps {
	name?: string;
}

export interface SubcontractorsTypes {
	id: string;
	name: string;
	verifyCompetency: File | undefined;
	reasonAssignment: string;
	evaluationDate: string;
	nextEvaluationDate: string;
}

export default function SubContractorsPage() {
	const [items, setItems] = useState<number>();
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [loading, setLoading] = useState<boolean>(false);
	const [addSubcontractor, setAddSubcontractor] = useState<boolean>(false);
	const [searchAttribute, setSearchAttribute] = useState<SearchAttributeProps>(
		{},
	);
	const [subcontractors, setSubContractors] = useState<SubcontractorsTypes[]>(
		[],
	);

	const getSubContractorsList = useCallback(async () => {
		setLoading(true);
		try {
			let res: any = await GetSubContractorsProps({
				page: currentPage,
				size: size,
				searchAttribute,
			});
			if (res) {
				setTimeout(() => {
					setSubContractors(res.result.data);
					setItems(res.result.count);
				}, 300);
			}
		} catch {
			toast.error("خطایی در دریافت اطلاعات رخ داد!");
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchAttribute, size]);

	useEffect(() => {
		getSubContractorsList();
	}, [getSubContractorsList]);

	return (
		<>
			{addSubcontractor && (
				<AddSubcontractorModal
					isShow={addSubcontractor}
					setShow={setAddSubcontractor}
					key={"addSubcontractor"}
					getData={getSubContractorsList}
				/>
			)}
			<Layout.Root>
				<div className="py-3" title={""}>
					<button
						type="button"
						onClick={() => !loading && setAddSubcontractor(true)}
						className="btn flex cursor-pointer select-none items-center rounded-md bg-blue-500 p-3 text-white hover:bg-blue-700"
					>
						<FaPlus size={10} className="ml-1" /> افزودن پیمانکار
					</button>
				</div>
				<SubContractors
					loading={loading}
					subcontractorsData={subcontractors}
					setSearch={setSearchAttribute}
					getData={getSubContractorsList}
					setLoading={setLoading}
				/>
				{
					<Pagination
						items={items ? items : 0}
						currentPage={currentPage}
						size={size}
						onPageChange={setCurrentPage}
						loading={loading}
						className="py-2"
						setSize={setSize}
					/>
				}
			</Layout.Root>
		</>
	);
}
