"use client";

import { useMemo } from "react";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Input } from "@/form/Input";
import { CaseType, caseType } from "@/inspection/models/CaseType";

import { ActionName } from "../../../models/ActionName";
import { ids } from "../../../models/Ids";
import CaseInvoice from "./CaseInvoice";
import CasePayer from "./CasePayer";
import CasePerson from "./CasePerson";
import CaseTable from "./CaseTable";
import CaseVoucher from "./CaseVoucher";

export default function CaseWidget() {
	const {
		task: { data },
	} = useTaskContext();

	const { [ids.actionName]: actionName } = data;

	const isActionReceipt = useMemo<boolean>(
		() => !actionName || actionName === ActionName.Receipt,
		[actionName],
	);

	return (
		<>
			{data[ids.caseType] && (
				<div className="col-span-3 col-start-1 space-y-2">
					<label>نوع درخواست:</label>
					<Input disabled value={caseType[data[ids.caseType] as CaseType]} />
				</div>
			)}

			<CasePayer />

			<CaseTable />

			<CasePerson />

			<CaseInvoice />

			{isActionReceipt && <CaseVoucher />}
		</>
	);
}
