"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { useLoadInspectionData } from "@/inspection/hooks/useLoadInspectionData";
import generateTemplate from "@/template-engine/services/generateTemplate";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { Ids } from "../../data";

const keys: { id: string; optional?: boolean }[] = [
	{ id: Ids.buyerData, optional: true },
	{ id: Ids.buyerId, optional: true },
	{ id: Ids.buyerName, optional: true },
	{ id: Ids.coordinatorSignature, optional: true },
	{ id: Ids.coordinator, optional: true },
	{ id: Ids.cottageDate, optional: true },
	{ id: Ids.cottageNo, optional: true },
	{ id: Ids.economicalNo, optional: true },
	{ id: Ids.nationalNo, optional: true },
	{ id: Ids.place, optional: true },
	{ id: Ids.productsData, optional: true },
	{ id: Ids.productOwner, optional: true },
	{ id: Ids.productOwnerSignature, optional: true },
	{ id: Ids.receipt, optional: true },
	{ id: Ids.samplerName, optional: true },
	{ id: Ids.samplerId, optional: true },
	{ id: Ids.samplerSignature, optional: true },
	{ id: Ids.sellerName, optional: true },
	{ id: Ids.title, optional: true },
	// { id: Ids.samplingPage },
	// { id: Ids.invoiceType, label: "نوع فاکتور" },
];

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

		const data = {
			caseNo: instance.caseNo,
			[Ids.buyerData]: instance.parameters[Ids.buyerData],
			[Ids.buyerId]: instance.parameters[Ids.buyerId],
			[Ids.buyerName]: instance.parameters[Ids.buyerName],
			[Ids.coordinatorSignature]: instance.parameters[Ids.coordinatorSignature],
			[Ids.coordinator]: instance.parameters[Ids.coordinator],
			[Ids.cottageDate]: instance.parameters[Ids.cottageDate],
			[Ids.cottageNo]: instance.parameters[Ids.cottageNo],
			[Ids.economicalNo]: instance.parameters[Ids.economicalNo],
			[Ids.nationalNo]: instance.parameters[Ids.nationalNo],
			[Ids.place]: instance.parameters[Ids.place],
			[Ids.productsData]: instance.parameters[Ids.productsData],
			[Ids.productOwner]: instance.parameters[Ids.productOwner],
			[Ids.productOwnerSignature]:
				instance.parameters[Ids.productOwnerSignature],
			[Ids.receipt]: instance.parameters[Ids.receipt],
			[Ids.samplerName]: instance.parameters[Ids.samplerName],
			[Ids.samplerId]: instance.parameters[Ids.samplerId],
			[Ids.samplerSignature]: instance.parameters[Ids.samplerSignature],
			[Ids.sellerName]: instance.parameters[Ids.sellerName],
			[Ids.title]: instance.parameters[Ids.title],
			[Ids.inspectionFeeInRial]: incomesTotal,
		};

		const payload = {
			name: "inspection/sampling/customs/Report.html",
			output: `${instance.caseNo} Report`,
			data,
		};

		return payload;
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
		<>
			<div className="shrink-0 space-y-10">
				<Head.Root>
					<Head.Title text="گزارش بازدید و نمونه برداری" />
				</Head.Root>

				<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<iframe
							className={"h-[32rem] w-a4-portrait overflow-y-auto"}
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
		</>
	);
}

export { PageReport };
