import { z } from "zod";

import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { PhasePage } from "./PhasePage";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export const InformationFormByAdmin: TaskDetailsReturn<FormData> = {
	schema,
	render: <PhasePage />,
};
