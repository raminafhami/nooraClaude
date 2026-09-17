const getPersianMonthNumber = (monthName: string): number => {
	const months = [
		"فروردین",
		"اردیبهشت",
		"خرداد",
		"تیر",
		"مرداد",
		"شهریور",
		"مهر",
		"آبان",
		"آذر",
		"دی",
		"بهمن",
		"اسفند",
	];

	return months.indexOf(monthName) + 1;
};

export { getPersianMonthNumber };
