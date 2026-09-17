"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { useLoadInspectionData } from "@/inspection/hooks/useLoadInspectionData";
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
	{ id: Ids.productsTotal, optional: true },
	{ id: Ids.containerNo, optional: true },
	{ id: Ids.scheduleDate, optional: true },
	{ id: Ids.reportConclusion, optional: true },
];

function PageReport() {
	const { instance } = useInspectionContext();
	const { isLoading: isDataLoading, errorMessage: dataErrorMessage } =
		useLoadInspectionData(true, keys);

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
			[Ids.productsTotal]: instance.parameters[Ids.productsTotal],
			[Ids.containerNo]: instance.parameters[Ids.containerNo],
			[Ids.scheduleDate]: instance.parameters[Ids.scheduleDate],
			[Ids.reportConclusion]: instance.parameters[Ids.reportConclusion],
			[Ids.inspectionFeeInRial]: incomesTotal,
		};

		const payload = {
			name: "inspection/sampling/boushehr/report.html",
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

	if (isDataLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (dataErrorMessage) {
		return (
			<DestructiveAlert>
				<AlertDescription>{dataErrorMessage}</AlertDescription>
			</DestructiveAlert>
		);
	}

	return (
		<>
			<div className="shrink-0 space-y-10">
				<Head.Root>
					<Head.Title text="گزارش بازدید و نمونه برداری" />
				</Head.Root>

				<div className="flex flex-col gap-3 xs:flex-row">
					<Button
						className="xs:min-w-24"
						disabled={isPending}
						type="button"
						onClick={handleDownloadClick}
					>
						<Spinner loading={isPending} size="sm">
							دانلود گزارش
						</Spinner>
					</Button>
				</div>
			</div>
		</>
	);
}

export { PageReport };
