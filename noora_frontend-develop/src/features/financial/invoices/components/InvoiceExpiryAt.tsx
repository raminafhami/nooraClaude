import moment from "jalali-moment";

import { cn } from "@/lib/utils";

type Props = {
	date: Date | null | undefined | string;
};

const InvoiceExpiryAt = ({ date }: Props) => {
	const formattedDate = date ? moment(date).locale("fa") : null;
	const today = moment().locale("fa").startOf("day");
	const isBeforeToday = formattedDate?.isBefore(today, "day");

	const formattedDateString = formattedDate
		? formattedDate.format("YYYY/MM/DD")
		: "بدون انقضا";

	return (
		<div className={cn(isBeforeToday && "text-red-600")}>
			{formattedDateString}
		</div>
	);
};

export { InvoiceExpiryAt };
