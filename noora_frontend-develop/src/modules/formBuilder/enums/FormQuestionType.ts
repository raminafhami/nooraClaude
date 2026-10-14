enum FormQuestionType {
	ShortText = "short_text",
	LongText = "long_text",
	Boolean = "boolean",
	Number = "number",
	Percent = "percent",
	SingleChoice = "single_choice",
	MultiChoice = "multi_choice",
	Date = "date",
	Time = "time",
	DateTime = "datetime",
	Amount = "amount",
	Rating = "rating",
	File = "file",
	StaticText = "static_text",
}

const FORM_QUESTION_TYPE_LABELS: Record<FormQuestionType, string> = {
	[FormQuestionType.ShortText]: "متن کوتاه",
	[FormQuestionType.LongText]: "متن بلند",
	[FormQuestionType.Boolean]: "بله / خیر",
	[FormQuestionType.Number]: "عددی",
	[FormQuestionType.Percent]: "درصدی",
	[FormQuestionType.SingleChoice]: "تک‌گزینه‌ای",
	[FormQuestionType.MultiChoice]: "چندگزینه‌ای",
	[FormQuestionType.Date]: "تاریخ",
	[FormQuestionType.Time]: "ساعت",
	[FormQuestionType.DateTime]: "تاریخ و ساعت",
	[FormQuestionType.Amount]: "مبلغ",
	[FormQuestionType.Rating]: "امتیازدهی",
	[FormQuestionType.File]: "فایل یا تصویر",
	[FormQuestionType.StaticText]: "متن ثابت / راهنما",
};

const CHOICE_QUESTION_TYPES = [
	FormQuestionType.SingleChoice,
	FormQuestionType.MultiChoice,
];

const NON_ANSWERABLE_QUESTION_TYPES = [FormQuestionType.StaticText];

export {
	FormQuestionType,
	FORM_QUESTION_TYPE_LABELS,
	CHOICE_QUESTION_TYPES,
	NON_ANSWERABLE_QUESTION_TYPES,
};
