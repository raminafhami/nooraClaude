import moment from "jalali-moment";

const JALALI_FORMAT = "jYYYY/jMM/jDD";

/** API date (ISO, Gregorian) -> Jalali string used by the date inputs. */
function toJalaliInput(date: string | null | undefined): string {
	return date ? moment(date).format(JALALI_FORMAT) : "";
}

/** Jalali string from the date inputs -> Gregorian date sent to the API. */
function toApiDate(jalali: string): string {
	return moment(jalali, JALALI_FORMAT).format("YYYY-MM-DD");
}

function isJalaliBefore(a: string, b: string): boolean {
	return moment(a, JALALI_FORMAT).isBefore(moment(b, JALALI_FORMAT), "day");
}

export { isJalaliBefore, toApiDate, toJalaliInput };
