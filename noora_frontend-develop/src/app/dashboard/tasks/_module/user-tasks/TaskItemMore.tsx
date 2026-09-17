import { addCommas } from "persian-tools";
import { memo, useMemo } from "react";
import { FaCaretLeft } from "react-icons/fa6";

import { currencies } from "@/inspection/flows/coi/models/Currencies";
import { InspectionType } from "@/inspection/models/InspectionType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { GenericObject } from "@/ts/GenericObject";

interface Props {
	processKey: string;
	data: GenericObject;
}

export const TaskItemMore = memo(function TaskItemMore({
	processKey,
	data,
}: Props) {
	const items = useMemo<string[][]>(() => {
		if (!data) {
			return [];
		}

		const result: string[][] = [];

		// try parse inspection type
		const inspectionType = detectInspectionType(processKey);

		// add actual data
		if (processKey === "PersonnelContract") {
			result.push(["پرسنل", data["Assignees"]?.personnel?.name ?? "؟"]);
		}

		// related caseNo
		if (
			data["InspectionCaseNo"] ??
			data["RelatedInspectionCaseNo"] ??
			data["CaseItems"]
		) {
			result.push([
				"فایل بازرسی",
				data["InspectionCaseNo"] ??
					data["RelatedInspectionCaseNo"] ??
					data["CaseItems"]?.map((x: any) => x.caseNo)?.join("، "),
			]);
		}

		if (data["InvoiceItems"]) {
			const caseNos = Array.from(
				new Set(
					data["InvoiceItems"].flatMap((x: any) =>
						Array.from(new Set(x.caseNos)),
					),
				),
			).join("، ");

			if (caseNos) result.push(["فایل بازرسی", caseNos]);
		}

		// assignees
		if (data["Assignees"]) {
			const assignees = data["Assignees"];

			if (assignees.initiator) {
				result.push(["ایجاد کننده", assignees.initiator.name]);
			} else if (assignees.creator) {
				result.push(["ایجاد کننده", assignees.creator.name]);
			}

			if (inspectionType === InspectionType.COI) {
				if (assignees.technicalExpert) {
					result.push(["کارشناس فنی", assignees.technicalExpert.name]);
				}

				if (assignees.seniorExpert) {
					result.push(["کارشناس ارشد", assignees.seniorExpert.name]);
				}

				if (assignees.technicalManager) {
					result.push(["مدیر فنی", assignees.technicalManager.name]);
				}
			} else {
				if (assignees.technicalExpert) {
					result.push(["کارشناس", assignees.technicalExpert.name]);
				} else if (assignees.expert) {
					result.push(["کارشناس", assignees.expert.name]);
				}
			}

			if (assignees.coordinator) {
				result.push(["هماهنگ کننده", assignees.coordinator.name]);
			}

			if (assignees.customer) {
				result.push(["مشتری", assignees.customer.name]);
			}
		}

		// general
		if (data["Buyer"] || data["BuyerName"]) {
			result.push(["خریدار", data["Buyer"]?.name || data["BuyerName"]]);
		}

		// PROCESS: COI Inspection
		if (processKey === "Inspection_Case_COI") {
			if (data["CustomName"]) {
				result.push(["گمرک", data["CustomName"]]);
			}
		}

		// PROCESS: Inspection Operation
		if (processKey === "Inspectors") {
			if (data["InspectorName"]) {
				result.push(["بازرس", data["InspectorName"]]);
			}
			if (data["CustomName"]) {
				result.push(["گمرک", data["CustomName"]]);
			}
		}

		// PROCESS: Payment Order
		if (processKey === "paymentOrder") {
			if (data["UserData"]) {
				result.push(["درخواست دهنده", data["UserData"]]);
			}
			if (data["Title"]) {
				result.push(["عنوان", data["Title"]]);
			}
			if (data["Amount"] && data["Currency"]) {
				const currencyLabel = currencies.find(
					(currency) => currency.value === data["Currency"],
				)?.label;

				result.push(["مبلغ", `${addCommas(data["Amount"])} ${currencyLabel}`]);
			}
		}
		return result;
	}, [data, processKey]);

	if (!items.length) {
		return "-";
	}

	return (
		<div className="space-y-1">
			{items.map((item, index) => (
				<div key={index} className="flex items-center gap-1">
					<span>{item[0]}</span>
					<FaCaretLeft className="text-[10px] text-gray-500" />
					<span className="text-gray-500">{item[1]}</span>
				</div>
			))}
		</div>
	);
});
