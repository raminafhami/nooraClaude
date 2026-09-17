import { cn } from "@/lib/utils";
import { toCurrency } from "@/utils/String";

interface Props {
	remaining: number;
}

export default function CaseRemaining({ remaining }: Props) {
	return (
		<div
			className={cn(
				"text-xs",
				remaining === 0 ? "text-green-700" : "text-red-700",
			)}
		>
			(باقی مانده: <span dir="ltr">{toCurrency(remaining.toString())}</span>{" "}
			ریال)
		</div>
	);
}
