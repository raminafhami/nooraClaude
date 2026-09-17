import moment from "jalali-moment";

type JalaliMonthsAndYears = {
	jalaliMonth: string;
	jalaliMonthName: string;
	jalaliYear: string;
	gregorianMonth: string;
	gregorianMonthName: string;
	gregorianYear: string;
};

const APP_START_DATE = "1403-01";

function getJalaliMonthsAndYears(): JalaliMonthsAndYears[] {
	const monthsAndYears: JalaliMonthsAndYears[] = [];

	const startDate = moment(APP_START_DATE, "jYYYY-jMM");
	const endDate = moment();

	let currentDate = startDate;
	while (
		currentDate.isBefore(endDate) ||
		currentDate.isSame(endDate, "jMonth")
	) {
		monthsAndYears.push({
			jalaliMonth: currentDate.format("jMM"),
			jalaliMonthName: currentDate.clone().locale("fa").format("MMMM"),
			jalaliYear: currentDate.format("jYYYY"),
			gregorianMonth: currentDate.format("MM"),
			gregorianMonthName: currentDate.format("MMMM"),
			gregorianYear: currentDate.format("YYYY"),
		});

		currentDate.add(1, "jMonth");
	}

	monthsAndYears.reverse();

	return monthsAndYears;
}

export { getJalaliMonthsAndYears };
