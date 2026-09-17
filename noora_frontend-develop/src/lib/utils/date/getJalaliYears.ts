import moment from "jalali-moment";

type JalaliYears = {
	jalaliYear: string;
	gregorianYear: string;
};

const APP_START_DATE = "1403-01";

function getJalaliYears(): JalaliYears[] {
	const years: JalaliYears[] = [];

	const startDate = moment(APP_START_DATE, "jYYYY-jMM");
	const endDate = moment();

	let currentDate = startDate;
	while (
		currentDate.isBefore(endDate) ||
		currentDate.isSame(endDate, "jYear")
	) {
		years.push({
			jalaliYear: currentDate.format("jYYYY"),
			gregorianYear: currentDate.format("YYYY"),
		});

		currentDate.add(1, "jYear");
	}

	years.reverse();

	return years;
}

export { getJalaliYears };
