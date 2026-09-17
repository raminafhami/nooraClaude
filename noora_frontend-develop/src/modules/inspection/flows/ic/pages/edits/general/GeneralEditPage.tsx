"use client";

import { useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { useLoadInspectionData } from "@/inspection/hooks/useLoadInspectionData";
import { Loading } from "@/ui/Loader";

import { ids } from "../../../models/Ids";
import { GeneralEditForm } from "./GeneralEditForm";

const keys: { id: string; optional?: boolean }[] = [
	{ id: ids.inspectionMethod },
	{ id: ids.proformaNo },
	{ id: ids.proformaDate },
	{ id: ids.registrationOrderNo },
	{ id: ids.registrationOrderDate },
	{ id: ids.bankName },
	{ id: ids.bankBranch },
	{ id: ids.customName },
	{ id: ids.goodsField },
	{ id: ids.invoiceFob },
	{ id: ids.dischargerName },
	{ id: ids.dischargerPhoneNo },
	{ id: ids.buyerNameEn, optional: true },
	{ id: ids.seller },
	{ id: ids.applicant },
	{ id: ids.shipper },
	{ id: ids.invoiceNo },
	{ id: ids.invoiceDate },
	{ id: ids.insuranceCompany },
	{ id: ids.insurancePolicyNo },
	{ id: ids.billOfLadingNo },
	{ id: ids.billOfLadingDate },
	{ id: ids.billOfLadingQuantity },
	{ id: ids.grossWeight },
	{ id: ids.netWeight },
	{ id: ids.packing },
	{ id: ids.shippedFrom },
	{ id: ids.shippedTo },
	{ id: ids.countryOfOrigin },
	{ id: ids.goodsCustomTariffNos },
	{ id: ids.inspectionPlace },
	{ id: ids.inspectionDate },
	{ id: ids.inspectionQualityDescription },
	{ id: ids.inspectionRemarkDescription },
	{ id: ids.certificateConclusion },
];

const keyIds = keys.map((x) => x.id);

function GeneralEditPage() {
	const { instance } = useInspectionContext();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<React.ReactNode>();

	useEffect(() => {
		if (!isLoading) return;

		try {
			if (instance.status === InstanceStatus.Canceled) {
				throw new Error("ویرایش اطلاعات برای درخواست لغو شده امکان پذیر نیست.");
			}

			if (instance.status !== InstanceStatus.Completed) {
				throw new Error(
					"پیش از اتمام درخواست، امکان ویرایش در این بخش وجود ندارد.",
				);
			}
		} catch (err: any) {
			console.error(err);
			setErrorMessage(
				err.message || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
			);
		} finally {
			setIsLoading(false);
		}
	}, [isLoading, instance]);

	const { isLoading: isDataLoading, errorMessage: dataErrorMessage } =
		useLoadInspectionData(!isLoading && !errorMessage, keys);

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

	return <GeneralEditForm />;
}

export { GeneralEditPage, keyIds };
