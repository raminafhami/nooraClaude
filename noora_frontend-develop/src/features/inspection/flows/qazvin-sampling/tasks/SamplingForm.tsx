import { z } from "zod";

import { PhasePage as CustomsSamplingPage } from "@/inspection/flows/customsSampling/tasks/SamplingForm/PhasePage";
import { schema as customsSchema } from "@/inspection/flows/customsSampling/tasks/SamplingForm/PhaseSchema";

import { QazvinFields } from "../components/QazvinFields";
import { qazvinSamplingKeys } from "../data/Ids";

const schema = customsSchema.extend(
	Object.fromEntries(qazvinSamplingKeys.map((key) => [key, z.string()])) as {
		[K in (typeof qazvinSamplingKeys)[number]]: z.ZodString;
	},
);

/** «تکمیل اطلاعات اولیه»: the customs sampling form + the Qazvin shipment fields */
export const QazvinSamplingForm = {
	schema,
	render: (
		<>
			<CustomsSamplingPage />
			<QazvinFields section="sampling" />
		</>
	),
};
