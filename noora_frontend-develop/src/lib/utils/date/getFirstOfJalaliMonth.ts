import moment from "jalali-moment";

function getFirstOfJalaliMonth(monthIndex: number) {
	return moment().jYear(moment().jYear()).jMonth(monthIndex).startOf("jMonth");
}

export { getFirstOfJalaliMonth };
