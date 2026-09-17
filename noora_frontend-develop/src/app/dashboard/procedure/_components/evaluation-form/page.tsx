"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

import GetAllForms from "@/api/forms/getAllForms";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import Pagination from "@/components/ui/pagination/Pagination";

import { EvaluationTable } from "./_components/EvaluationTable";

interface SearchAttributeProps {
	expertiseId?: string;
}

export default function EvalutaionPage() {
	const [form, setForm] = useState<any>();
	const [items, setItems] = useState<number>();
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [loading, setLoading] = useState<boolean>(false);
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();

	const getForms = useCallback(async () => {
		setLoading(true);
		try {
			let res: any = await GetAllForms({
				page: +currentPage,
				size: +size,
			});
			if (res) {
				setTimeout(() => {
					setForm(res.result.data);
					setItems(res.result.count);
					setLoading(false);
				}, 300);
			}
		} catch {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}, [currentPage, size]);

	useEffect(() => {
		getForms();
	}, [searchAttribute, currentPage, getForms]);

	return (
		<div className="space-y-6">
			<div>
				<DynamicLink href="/dashboard/form-generator">
					<Button>
						<FaPlus size={10} />
						<span className="ms-1">افزودن</span>
					</Button>
				</DynamicLink>
			</div>

			<div>
				{form?.map((data: any, index: number) => (
					<>
						<EvaluationTable loading={loading} form={data} index={index} />
					</>
				))}
			</div>

			<Pagination
				items={items ? items : 0}
				currentPage={currentPage}
				size={size}
				onPageChange={setCurrentPage}
				loading={loading}
				className="py-2"
				setSize={setSize}
			/>
		</div>
	);
}
