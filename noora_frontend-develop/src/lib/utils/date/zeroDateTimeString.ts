import moment, { Moment } from "jalali-moment";

function zeroDateTimeString(date: Moment | Date | string | number): string {
	return `${moment(date).format("YYYY-MM-DD")}T00:00:00.000Z`;
}

export { zeroDateTimeString };
