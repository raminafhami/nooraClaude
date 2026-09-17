"use client";

import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { FinancialsPage } from "@/financial/financial/components/page-financials/FinancialsPage";
import { InspectionInvoicesPage } from "@/financial/invoices/components/inspection-invoices/InspectionInvoicesPage";
import { InspectionDocuments } from "@/inspection/components/InspectionDocuments";
import { InspectionTicketList } from "@/inspection/components/InspectionTicketList";
import { InspectionContext } from "@/inspection/context/InspectionContext";
import { InspectionType } from "@/inspection/models/InspectionType";
import { Layout, Wait } from "@/ui/Layout";

import { InspectionPic } from "../../_module/inspection-pic/InspectionPic";
import { InspectionProcessPage } from "../../_module/inspection-process/InspectionProcessPage";
import { ids } from "../models/Ids";
import { BankLetterPage } from "./BankLetter/BankLetterPage";
import { CertificatePage } from "./certificate/CertificatePage";
import { EditsPage } from "./edits/EditsPage";
import { PageNavigation } from "./PageNavigation";
import { PageSecretariat } from "./PageSecretariat/PageSecretariat";

export type PageSection =
	| "edits"
	| "financials"
	| "bank-letter"
	| "invoice"
	| "certificate"
	| "documents"
	| "ticket"
	| "secretariat"
	| "inspectionPic"
	| "inspection-process";

interface Props {
	id: string;
}

export const PageWidget = memo(function PageWidget({ id }: Props) {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [instance, setInstance] = useState<Instance>({} as any);
	const [section, setSection] = useState<PageSection | null>(null);

	const params = useSearchParams();
	const page = params?.get("page");
	const size = params?.get("size");

	const handleSectionChange = useCallback((s: PageSection) => {
		setSection(s);
	}, []);

	const handleInstanceUpdate = useCallback((parameters: any): void => {
		if (!parameters || typeof parameters !== "object") {
			return;
		}

		setInstance(({ parameters: previousParameters, ...previous }) => ({
			...previous,
			parameters: { ...previousParameters, ...parameters },
		}));
	}, []);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError(null);

				const instance = await getInstanceById(id, [
					"ownerGroup",
					ids.assignees,
					ids.inspectionInstanceId,
				]);
				setInstance(instance);
			} catch (err: any) {
				setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	return isLoading ? (
		<Wait />
	) : (
		<InspectionContext.Provider
			value={{ instance, onInstanceUpdate: handleInstanceUpdate }}
		>
			<Layout.Root>
				<Layout.Head
					title={`درخواست بازرسی ${
						(instance.id && `شماره ${instance.caseNo}`) || ""
					}`}
				>
					<DynamicLink
						className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-black transition hover:bg-gray-100 focus:bg-gray-100"
						href={`/dashboard/inspection?page=${page}&size=${size}`}
					>
						<FaAngleRight className="text-2xs" />
						<span className="ms-1">بازگشت به لیست</span>
					</DynamicLink>
				</Layout.Head>
				<Layout.Content>
					{error ? (
						<DestructiveAlert>
							<AlertDescription>{error}</AlertDescription>
						</DestructiveAlert>
					) : (
						<>
							<PageNavigation
								section={section}
								onChange={handleSectionChange}
							/>
							<PageSection instance={instance} section={section} />
						</>
					)}
				</Layout.Content>
			</Layout.Root>
		</InspectionContext.Provider>
	);
});

const PageSection = memo(function PageSection({
	section,
	instance,
}: {
	instance: Instance;
	section: PageSection | null;
}) {
	switch (section) {
		case "edits":
			return <EditsPage />;
		case "financials":
			return <FinancialsPage />;
		case "bank-letter":
			return <BankLetterPage />;
		case "invoice":
			return <InspectionInvoicesPage />;
		case "certificate":
			return <CertificatePage />;
		case "documents":
			return <InspectionDocuments />;
		case "ticket":
			return <InspectionTicketList instance={instance} />;
		case "secretariat":
			return <PageSecretariat instanceData={instance} />;
		case "inspectionPic":
			return <InspectionPic instanceData={instance} />;
		case "inspection-process":
			return <InspectionProcessPage inspectionType={InspectionType.Bank_COI} />;
		default:
			return <></>;
	}
});
