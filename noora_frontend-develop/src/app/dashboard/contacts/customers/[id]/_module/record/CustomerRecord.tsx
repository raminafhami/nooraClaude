import { FaClipboardUser } from "react-icons/fa6";

import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";

import { CustomerRecordCredit } from "./CustomerRecordCredit";
import { CustomerRecordDebt } from "./CustomerRecordDebt";

function CustomerRecord() {
	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>
					<CardIcon>
						<FaClipboardUser />
					</CardIcon>
					وضعیت حساب مشتری
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-12 gap-6">
					<CustomerRecordCredit />
					<CustomerRecordDebt />
				</div>
			</CardContent>
		</Card>
	);
}

export { CustomerRecord };
