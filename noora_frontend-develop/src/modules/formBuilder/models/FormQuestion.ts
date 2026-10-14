import { FormQuestionType } from "../enums/FormQuestionType";

type FormQuestionOption = {
	id?: string;
	title: string;
	order: number;
};

type FormQuestionSettings = {
	maxLength?: number | null;
	minValue?: number | null;
	maxValue?: number | null;
	decimals?: number | null;
	currency?: string | null;
	scaleMin?: number | null;
	scaleMax?: number | null;
	options?: FormQuestionOption[];
	maxFiles?: number | null;
	maxFileSizeMb?: number | null;
	allowedFileTypes?: string[];
};

type FormQuestion = {
	id?: string;
	title: string;
	description?: string | null;
	type: FormQuestionType;
	required: boolean;
	order: number;
	settings?: FormQuestionSettings;
};

export type { FormQuestionOption, FormQuestionSettings, FormQuestion };
