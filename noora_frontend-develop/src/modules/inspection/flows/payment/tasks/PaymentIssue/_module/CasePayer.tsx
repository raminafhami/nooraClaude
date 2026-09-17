"use client";

import { useFormContext } from "react-hook-form";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";

import { AssigneeType } from "../../../models/Assignee";
import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";

export default function CasePayer() {
	const {
		task: { data },
	} = useTaskContext();

	const { watch } = useFormContext<FormData>();
	const { [ids.payerSepidarId]: sepidarId } = watch();

	return (
		data[ids.assignees][AssigneeType.Payer] && (
			<div className="col-span-3 space-y-2">
				<label className="flex items-center gap-2">
					<span>نماینده/مشتری:</span>
					{data[ids.assignees][AssigneeType.Payer] && (
						<>
							<DynamicLink
								href={`/dashboard/contacts/customers/${
									data[ids.assignees][AssigneeType.Payer]?.id
								}`}
							>
								<FaArrowUpRightFromSquare size={10} />
							</DynamicLink>
						</>
					)}
				</label>
				<Input
					disabled
					value={`${sepidarId ?? "؟"} - ${
						data[ids.assignees][AssigneeType.Payer]?.name
					}`}
				/>
				<FieldError
					error={!sepidarId ? { message: "عدم وجود شناسه سپیدار" } : undefined}
				/>
			</div>
		)
	);
}
