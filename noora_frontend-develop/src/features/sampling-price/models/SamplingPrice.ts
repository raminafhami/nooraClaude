type SamplingPriceVersion = {
	id: string;
	price: number;
	effectiveFrom: string;
	note?: string;
	createdAt?: string;
};

type SamplingPrice = {
	id: string;
	title: string;
	/** sampling process keys the service is offered in; empty = all */
	processKeys: string[];
	prices: SamplingPriceVersion[];
	/** not offered for samplings on or after this date */
	deprecatedFrom: string | null;
	isDeleted: boolean;
};

/** a service with the price in force on a given date */
type EffectiveSamplingPrice = {
	id: string;
	title: string;
	price: number;
	priceId: string;
	effectiveFrom: string;
};

const samplingProcesses = [
	{ value: "CustomsSampling", label: "نمونه برداری گمرکی" },
	{ value: "ImamSampling", label: "نمونه برداری امام خمینی (ره)" },
	{ value: "BoushehrSampling", label: "نمونه برداری بوشهر" },
	{ value: "BandarAbbasSampling", label: "نمونه برداری بندرعباس" },
	{ value: "QazvinSampling", label: "نمونه برداری گمرکی قزوین" },
	{ value: "ProductiveSampling", label: "نمونه برداری تولیدی" },
];

export { samplingProcesses };
export type { EffectiveSamplingPrice, SamplingPrice, SamplingPriceVersion };
