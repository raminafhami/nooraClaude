"use client";

import { memo, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Loading } from "@/ui/Loader";

import { ids } from "../../models/Ids";
import { BankLetterDisplay } from "./BankLetterDisplay";
import { EditBankLetter } from "./EditBankLetter";

const keysAndLabels: { key: string; label?: string }[] = [
	{ key: ids.buyer, label: "خریدار" },
	{ key: ids.bankBranch, label: "شعبه بانک" },
	{ key: ids.bankName, label: "بانک" },
	{ key: ids.customName, label: "گمرک" },
	{ key: ids.goodsCustomTariffNos, label: "شماره تعرفه گمرکی کالاها" },
	{ key: ids.goodsDescriptions, label: "شرح کالاها" },
	{ key: ids.inspectionMethod },
	{ key: ids.proformaDate, label: "تاریخ پروفرما" },
	{ key: ids.proformaNo, label: "شماره پروفرما" },
	{ key: ids.registrationOrderDate, label: "تاریخ ثبت سفارش" },
	{ key: ids.registrationOrderNo, label: "شماره ثبت سفارش" },
];

export const bankLetterKeys = keysAndLabels.map((x) => x.key);

export const PageBankLetter = memo(function PageBankLetter(): React.ReactNode {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<React.ReactNode | null>(null);

	useEffect(() => {
		(async () => {
			let data: any = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: any = {};

			try {
				if (
					keysAndLabels.filter((x) => data[x.key] === undefined).length !== 0
				) {
					setLoading(true);
					setError(null);

					data = await getInstanceById(
						instance.id,
						keysAndLabels.map((x) => x.key),
					).then((instance) => instance.parameters || {});

					keysAndLabels.forEach((item) => {
						if (data[item.key] === undefined && item.label) {
							incompleteData.push(item.label);
						} else {
							updateData[item.key] = data[item.key];
						}
					});
				}

				if (Object.keys(updateData).length !== 0) {
					onInstanceUpdate(updateData);
				}

				if (incompleteData.length !== 0) {
					throw new Error(
						`فیلدهای مقابل تکمیل نشده اند: ${incompleteData.join("، ")}`,
					);
				}
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Something went wrong.");
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{isLoading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : !instance.parameters[ids.bankName] ||
			  !instance.parameters[ids.bankBranch] ? (
				// <Alert intent="info">نامه بانک برای این درخواست تعریف نشده است.</Alert>
				<EditBankLetter />
			) : (
				<div className="flex space-y-12">
					<BankLetterDisplay />
				</div>
			)}
		</>
	);
});
