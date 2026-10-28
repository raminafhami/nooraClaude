import { ExpertiseType } from "../enums/ExpertiseType";
import { Expertise } from "../models/Expertise";
import { createExpertise } from "./createExpertise";
import { getExpertises } from "./getExpertises";

// Same rule as the backend: type + title, Arabic/Persian letters, ZWNJ and
// spaces aside.
const normalize = (title: string | undefined) =>
	(title ?? "")
		.replace(/ي/g, "ی")
		.replace(/ك/g, "ک")
		.replace(/‌/g, " ")
		.replace(/\s+/g, " ")
		.trim();

async function findExisting(type: ExpertiseType, title: string) {
	const sameType = await getExpertises({ filters: { type } });
	return sameType.find((x) => normalize(x.title) === normalize(title));
}

// A title typed into a job description: the existing item if there is one
// (duplicates are refused by the backend), otherwise a new one.
async function findOrCreateExpertise(input: {
	title: string;
	type: ExpertiseType;
}): Promise<Expertise> {
	const existing = await findExisting(input.type, input.title);
	if (existing) return existing;

	try {
		return await createExpertise(input);
	} catch (err: any) {
		// created in the meantime (e.g. the same title added twice to the form)
		const created =
			err?.statusCode === 409 && (await findExisting(input.type, input.title));
		if (created) return created;
		throw err;
	}
}

export { findOrCreateExpertise };
