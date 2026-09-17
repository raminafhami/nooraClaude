"use client";

import moment from "moment-jalaali";
import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import GetAudit from "@/api/assetRequirement/getAudit";
import { useTableStore } from "@/cache/store/tableStore";
import { useTableData } from "@/cache/tableHook";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";

import { AuditType } from "../../[id]/_components/types/auditType";
import AddAudit from "../modal/AddAudit";
import { Audit } from "./Audit";

interface SearchAttributeProps {
	category?: string;
	title?: string;
	auditNo?: string;
	state?: string;
	userGroups?: string[];
	users?: string;
}

interface AuditPageProps {
	isRisk?: boolean;
	filters?: SearchAttributeProps;
	readonly?: boolean;
	selectedAudit?: AuditType;
	setSelectedAudit?: (s: AuditType) => void;
}

export default function AuditPage({
	isRisk,
	filters = undefined,
	readonly,
	selectedAudit,
	setSelectedAudit,
}: AuditPageProps) {
	const getTableKey = () => {
		if (isRisk) {
			return `Audit${readonly ? "Profile" : ""}RiskTable`;
		}
		return `Audit${readonly ? "Profile" : ""}Table`;
	};

	const [audit, setAudit] = useState<AuditType[]>([]);

	const {
		currentPage,
		setCurrentPage,
		size,
		setSize,
		searchAttribute,
		setSearchAttribute,
	} = useTableData({
		tableName: getTableKey(),
		initialPage: 0,
		initialSize: 10,
		initialFilters: filters,
		data: audit,
	});

	const [items, setItems] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [addAuditModal, setAddAuditModal] = useState<boolean>(false);

	const getAuditList = useCallback(async () => {
		setLoading(true);
		try {
			const res: any = await GetAudit({
				page: currentPage,
				size: size,
				searchAttribute,
			});
			if (res) {
				setAudit(res.result.data);
				setItems(res.result.count);
				setLoading(false);
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			console.log(e);

			setLoading(false);
		}
	}, [currentPage, searchAttribute, size]);

	async function generateExcel() {
		const data = audit.map((item, index) => ({
			ردیف: index + 1,
			نام: item?.title,
			کد: item?.auditNo,
			"شماره بازنگری": item?.reviewNumber,
			"تاریخ صدور": moment(item?.date).locale("fa").format("jYYYY/jMM/jDD"),
			"دسته بندی": item?.category,
			"تهیه کننده": `${item?.producer?.name ? item.producer.name : "-"} ${
				item?.producer?.lastname ? item.producer.lastname : ""
			}`,
			"تائید کننده": `${item?.seconder?.name ? item.seconder.name : "-"} ${
				item?.seconder?.lastname ? item.seconder.lastname : ""
			}`,
			"تصویب کننده": `${item?.approver?.name ? item.approver.name : "-"} ${
				item?.approver?.lastname ? item.approver.lastname : ""
			}`,
			وضعیت: item?.state === true ? "تحت کنترل" : "منسوخ شده",
			"شرح تغییرات": item?.changeDescription,
		}));

		const workbook = {
			SheetNames: ["Sheet 1"],
			Sheets: {},
		};
		const worksheet = XLSX.utils.json_to_sheet(data);
		// @ts-ignore
		workbook.Sheets["Sheet 1"] = worksheet;

		XLSX.writeFile(
			workbook,
			"InspectionReport-" +
				moment(new Date()).format("jYYYY/jMM/jDD - HH:mm") +
				".xlsx",
		);
	}

	useEffect(() => {
		getAuditList();
	}, [getAuditList]);

	return (
		<>
			{addAuditModal && (
				<AddAudit
					isEdit={false}
					getData={getAuditList}
					isShow={addAuditModal}
					setShow={setAddAuditModal}
					isRisk={isRisk}
					key="addAudit"
				/>
			)}

			<div className="space-y-6">
				<div className="flex gap-2">
					{readonly ? (
						""
					) : (
						<div className="flex items-center">
							<Button
								disabled={loading}
								type="button"
								onClick={() => !loading && setAddAuditModal(true)}
							>
								<FaPlus size={10} />
								<span className="ms-1">افزودن چک لیست</span>
							</Button>
						</div>
					)}
					<div className="flex items-center">
						<Button
							disabled={loading}
							type="button"
							onClick={() => !loading && generateExcel()}
						>
							<span className="ms-1">دانلود Excel</span>
						</Button>
					</div>
				</div>

				<Audit
					loading={loading}
					auditData={audit}
					search={searchAttribute}
					setSearch={setSearchAttribute}
					setPage={setCurrentPage}
					getData={getAuditList}
					setLoading={setLoading}
					isRisk={isRisk}
					readonly={readonly}
					selectedAudit={selectedAudit}
					setSelectedAudit={setSelectedAudit}
					indexMin={currentPage * size}
				/>

				<Pagination
					items={items ? items : 0}
					currentPage={currentPage}
					size={size}
					onPageChange={setCurrentPage}
					loading={loading}
					className="py-2"
					setSize={(e) => {
						setSize(e);
						setCurrentPage(0);
					}}
				/>
			</div>
		</>
	);
}
