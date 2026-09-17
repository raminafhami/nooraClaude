import { Expertise } from "@/hrm/expertises/models/Expertise";

import { JobDescription, JobDescriptionApi } from "../models/Job";

export default function parseJob(from: JobDescriptionApi): JobDescription;
export default function parseJob(from: JobDescriptionApi[]): JobDescription[];
export default function parseJob(
	from: JobDescriptionApi | JobDescriptionApi[],
): JobDescription | JobDescription[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseJob(x));
	}

	const result: JobDescription = {
		...from,
		requirements: {
			...from.requirements,
			expertises: ((expertises) => {
				if (expertises.length === 0) {
					return [];
				}

				if (typeof expertises[0] === "object") {
					return expertises as Expertise[];
				}

				return expertises as string[];
			})(from.requirements.expertises),
		},
	};

	return result;
}
