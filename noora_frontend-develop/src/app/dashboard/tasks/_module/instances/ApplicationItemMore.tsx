import { memo, useMemo } from "react";
import { FaCaretLeft } from "react-icons/fa6";

import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";
import { InspectionType } from "@/inspection/models/InspectionType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";

function ApplicationItemMore({ instance }: { instance: Instance }) {
	const { processKey, status, parameters: data } = instance;

	const items = useMemo<string[][]>(() => {
		const result: string[][] = [];

		if (status === InstanceStatus.OnHold && instance.holdBy) {
			result.push(["متوقف کننده", instance.holdBy.name]);
		}

		if (!data) {
			return result;
		}

		if (processKey === "PersonnelContract") {
			result.push(["پرسنل", data["Assignees"]?.personnel?.name ?? "؟"]);
		}

		// try parse inspection type
		const inspectionType = detectInspectionType(processKey);

		// related caseNo
		if (
			(processKey === "InspectorsProcess" && data["InspectionCaseNo"]) ||
			data["RelatedInspectionCaseNo"] ||
			data["CaseItems"]
		) {
			result.push([
				"فایل بازرسی",
				data["InspectionCaseNo"] ||
					data["RelatedInspectionCaseNo"] ||
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

		return result;
	}, [processKey, status, data, instance.holdBy]);

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
}

const MemoizedApplicationItemMore = memo(ApplicationItemMore);

export { MemoizedApplicationItemMore as ApplicationItemMore };
