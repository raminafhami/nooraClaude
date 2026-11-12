"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Ids } from "@/inspection/flows/customsSampling/data";
import { useLoadInspectionData } from "@/inspection/hooks/useLoadInspectionData";
import generateTemplate from "@/template-engine/services/generateTemplate";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { qazvinInspectorKeys } from "../data/Ids";

/** everything the Qazvin form prints; all optional so a case in progress still shows */
const reportKeys: string[] = [
	Ids.buyerData,
	Ids.buyerId,
	Ids.buyerName,
	Ids.buyerAddress,
	Ids.cottageDate,
	Ids.cottageNo,
	Ids.receipt,
	Ids.place,
	Ids.title,
	Ids.productsData,
	Ids.productOwner,
	Ids.productOwnerSignature,
	Ids.samplerId,
	Ids.samplerName,
	Ids.samplerSignature,
	Ids.coordinator,
	Ids.coordinatorSignature,
	Ids.scheduleDate,
	Ids.pageNo,
	...qazvinInspectorKeys,
];

const keys = reportKeys.map((id) => ({ id, optional: true }));

function PageReport() {
	const { instance } = useInspectionContext();
	const { isLoading: isDataLoading, errorMessage: dataErrorMessage } =
		useLoadInspectionData(true, keys);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<React.ReactNode>();

	const [content, setContent] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const getTemplatePayload = useCallback(async () => {
		const incomes = await getIncomes({
			filters: { instanceId: instance.id },
		});
		const incomesTotal = incomes.reduce((acc, curr) => (acc += curr.total), 0);

		const data: Record<string, unknown> = {
			caseNo: instance.caseNo,
			[Ids.inspectionFeeInRial]: incomesTotal,
		};
		reportKeys.forEach((key) => {
			data[key] = instance.parameters?.[key] ?? "";
		});
		if (!Array.isArray(data[Ids.productsData])) {
			data[Ids.productsData] = [];
		}

		return {
			name: "inspection/sampling/qazvin/Report.html",
			output: `${instance.caseNo} Report`,
			data,
		};
	}, [instance.caseNo, instance.id, instance.parameters]);

	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleDownloadClick() {
		try {
			setIsPending(true);

			const payload = await getTemplatePayload();
			await downloadTemplate(payload);
		} catch (err: any) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	useEffect(() => {
		(async () => {
			if (isDataLoading) return;

			if (dataErrorMessage) {
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);

				const payload = await getTemplatePayload();
				const content = await generateTemplate({
					...payload,
					download: false,
				});

				if (content) {
					setContent(content);
				}
			} catch (err: any) {
				console.error(err);
				setErrorMessage(
					err?.message || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
				);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [isDataLoading, dataErrorMessage, getTemplatePayload]);

	if (isLoading || isDataLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (errorMessage || dataErrorMessage) {
		return (
			<DestructiveAlert>
				<AlertDescription>{errorMessage || dataErrorMessage}</AlertDescription>
			</DestructiveAlert>
		);
	}

	return (
		<div className="min-w-0 space-y-10">
			<Head.Root>
				<Head.Title text="گزارش بازرسی و نمونه برداری تعیین ماهیت کالا" />
			</Head.Root>

			{/* the form is A4 landscape (29.7cm): the iframe scrolls inside, the page does not */}
			<div className="w-full max-w-[calc(29.7cm+2rem)] rounded-xl border-e-8 border-s-8 border-gray-200">
				<div className="overflow-hidden border border-gray-200">
					<iframe
						className="h-[32rem] w-full"
						ref={iframeRef}
						srcDoc={content}
					></iframe>
				</div>
			</div>

			<div className="flex flex-col gap-3 xs:flex-row">
				<Button
					className="xs:min-w-24"
					disabled={isPending}
					type="button"
					onClick={() => {
						iframeRef.current?.contentWindow?.print();
					}}
				>
					پرینت
				</Button>

				<Button
					className="xs:min-w-24"
					disabled={isPending}
					type="button"
					onClick={handleDownloadClick}
				>
					<Spinner loading={isPending} size="sm">
						دانلود
					</Spinner>
				</Button>
			</div>
		</div>
	);
}

export { PageReport };
