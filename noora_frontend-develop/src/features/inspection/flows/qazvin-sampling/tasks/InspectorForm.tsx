import { z } from "zod";

import { PhasePage as CustomsInspectorPage } from "@/inspection/flows/customsSampling/tasks/InspectorForm/PhasePage";
import { schema as customsSchema } from "@/inspection/flows/customsSampling/tasks/InspectorForm/PhaseSchema";

import { QazvinFields } from "../components/QazvinFields";
import { qazvinInspectorKeys } from "../data/Ids";

const schema = customsSchema.extend(
	Object.fromEntries(qazvinInspectorKeys.map((key) => [key, z.string()])) as {
		[K in (typeof qazvinInspectorKeys)[number]]: z.ZodString;
	},
);

/**
 * «تکمیل اطلاعات نمونه برداری»: the customs sampler form (service type and
 * price, مهار codes, income) + the Qazvin product and inspection-result fields.
 */
export const QazvinInspectorForm = {
	schema,
	render: (
		<>
			<CustomsInspectorPage />
			<QazvinFields section="inspection" />
		</>
	),
};
