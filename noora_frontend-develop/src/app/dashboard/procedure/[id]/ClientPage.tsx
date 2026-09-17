"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import GetAssetRequirement from "@/api/assetRequirement/getAssetRequirement";
import GetAudit from "@/api/assetRequirement/getAudit";
import { DynamicLink } from "@/components/ui/dynamic-link";
import Pagination from "@/components/ui/pagination/Pagination";
import { Layout } from "@/ui/Layout";
import { Panel } from "@/ui/Panel";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { AssetRequirementTable } from "./_components/AssetRequirementTable";
import { AssesstType, AuditType } from "./_components/types/auditType";

interface SearchAttributeProps {
	expertiseId?: string;
}
interface ProcedurProps {
	auditId?: string;
}
export default function ProcedureIdClientPage({ auditId }: ProcedurProps) {
	const [assesst, setAssesst] = useState<AssesstType[]>([]);
	const [audit, setAudit] = useState<AuditType[]>([]);
	const [items, setItems] = useState<number>();
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [loading, setLoading] = useState<boolean>(false);
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const paramId = useParams();
	const param = auditId ? auditId : paramId?.id;
	const searchParams = useSearchParams();
	const readonly = auditId?.length;

	const getAuditList = useCallback(async () => {
		setLoading(true);
		let res: any = await GetAudit({
			page: 0,
			size: 99,
			id: param as string,
		});
		if (res) {
			setAudit(res.result.data);
		}
		setLoading(false);
	}, [param]);

	const getAssetRequirement = useCallback(async () => {
		setLoading(true);
		let res = await GetAssetRequirement({
			page: currentPage,
			size: size,
			id: param as string,
		});
		if (res) {
			setAssesst(res.result.data);
			setItems(res.result.count - 1);
		}
		setLoading(false);
	}, [currentPage, param, size]);

	useEffect(() => {
		if (param) {
			getAuditList();
			getAssetRequirement();
		}
	}, [searchAttribute, currentPage, param, getAuditList, getAssetRequirement]);

	return (
		<>
			<Layout.Root>
				<Layout.Head
					title={toFarsiNum(
						`${audit[0]?.category ? `${audit[0]?.category}:` : ""} ${
							audit[0]?.title ? audit[0]?.title : ""
						}`,
					)}
				>
					{!!!readonly && (
						<div className="mr-auto flex w-auto justify-end">
							<DynamicLink href="/dashboard/procedure/">
								<button className="mr-5 mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
									بازگشت
								</button>
							</DynamicLink>
						</div>
					)}
				</Layout.Head>
				<Layout.Content>
					<Panel.Root>
						<Panel.Container className="py-0">
							<AssetRequirementTable
								loading={loading}
								assesst={assesst}
								setSearch={setSearchAttribute}
								getData={getAssetRequirement}
								setLoading={setLoading}
								auditId={param as string}
								category={audit[0]?.category}
								readonly={!!readonly}
							/>
						</Panel.Container>
					</Panel.Root>
					{
						<Pagination
							items={items ? items : 0}
							currentPage={currentPage}
							size={size}
							onPageChange={setCurrentPage}
							loading={loading}
							setSize={setSize}
						/>
					}
				</Layout.Content>
			</Layout.Root>
		</>
	);
}
