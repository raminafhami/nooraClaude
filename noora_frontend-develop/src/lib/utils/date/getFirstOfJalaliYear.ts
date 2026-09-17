import moment from "jalali-moment";

function getFirstOfJalaliYear(year: number) {
	return moment().startOf("jYear").jYear(year);
}

export { getFirstOfJalaliYear };
