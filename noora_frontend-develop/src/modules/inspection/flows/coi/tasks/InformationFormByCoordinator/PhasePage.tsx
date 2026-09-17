"use client";

import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task } = useTaskContext();
	const { register } = useFormContext<FormData>();

	return (
		<>
			<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
				{task.data[ids.informationReviewStatus] && (
					<>
						<Referrer
							assigneeKey={AssigneeType.Manager}
							noteId={ids.informationReviewNote}
							noteType="danger"
						/>

						<Seperator className="mt-5" />
					</>
				)}

				<div className="col-span-full">
					<Alert variant="warn">
						<AlertDescription>
							از بارگذاری مدارک مورد نیاز جهت تشکیل فایل مطمئن شوید.
						</AlertDescription>
					</Alert>
				</div>

				<div className="col-span-full space-y-2">
					<label htmlFor={ids.informationFormByCoordinatorNote}>توضیحات:</label>
					<Textarea
						id={ids.informationFormByCoordinatorNote}
						{...register(ids.informationFormByCoordinatorNote)}
					/>
				</div>
			</div>
		</>
	);
}
