import moment from "jalali-moment";

// Format of the activity forms' date-time fields.
export const ACTIVITY_DATE_TIME_FORMAT = "jYYYY/jMM/jDD HH:mm";

export const REMINDER_IN_PAST_MESSAGE =
	"زمان یادآور گذشته است؛ لطفاً زمانی بعد از الان انتخاب کنید.";

// A reminder that was set or changed must be ahead of now (the picker fills
// a newly picked day with the current time, which is already past on save).
export function isReminderInPast(value: string, initial: string): boolean {
	if (!value || value === initial) return false;
	const time = moment(value, ACTIVITY_DATE_TIME_FORMAT, true);
	return time.isValid() && !time.isAfter(moment());
}
