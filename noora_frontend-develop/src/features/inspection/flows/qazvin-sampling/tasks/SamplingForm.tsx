import { PhasePage } from "./PhasePage";
import { schema } from "./PhaseSchema";

/** The only Qazvin stage. It does not render the customs sampling form. */
export const QazvinSamplingForm = {
	schema,
	render: <PhasePage />,
};
