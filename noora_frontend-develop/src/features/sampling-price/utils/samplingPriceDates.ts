import moment from "jalali-moment";

import { SamplingPrice, SamplingPriceVersion } from "../models/SamplingPrice";

/** jalali "YYYY/MM/DD" (from DateInput) -> ISO start of that day */
function jalaliToIso(value: string): string {
	return moment(value, "jYYYY/jMM/jDD").startOf("day").toISOString();
}

function isoToJalali(value: string | null | undefined): string {
	return value ? moment(value).format("jYYYY/jMM/jDD") : "";
}

/** the price in force on `date`, and the next announced one after it */
function getPriceVersions(
	service: SamplingPrice,
	date: Date = new Date(),
): { current?: SamplingPriceVersion; next?: SamplingPriceVersion } {
	const sorted = [...(service.prices ?? [])].sort(
		(a, b) =>
			new Date(a.effectiveFrom).getTime() - new Date(b.effectiveFrom).getTime(),
	);

	const current = sorted
		.filter((x) => new Date(x.effectiveFrom) <= date)
		.at(-1);
	const next = sorted.find((x) => new Date(x.effectiveFrom) > date);

	return { current, next };
}

export { getPriceVersions, isoToJalali, jalaliToIso };
