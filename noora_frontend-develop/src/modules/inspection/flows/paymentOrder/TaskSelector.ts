import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { PaymentApplyDocument } from "./tasks/PaymentApplyDocument";
import { PaymentCompletion } from "./tasks/PaymentCompletion";
import { PaymentRequest } from "./tasks/PaymentRequest";
import { PaymentReview } from "./tasks/PaymentReview";
import { PaymentView } from "./tasks/PaymentView";

export function getPaymentOrderTaskDetails(
	task: Task,
	debug?: boolean,
): TaskDetailsReturn {
	if (task.instanceVersion >= 5 && !debug) {
		try {
			const details = require(`./new-tasks/${task.key}`).default;

			if (details) return details;
		} catch {}
	}

	switch (task.key) {
		case "PaymentOrderRequest":
			return PaymentRequest;
		case "PaymentOrderReview":
			return PaymentReview;
		case "PaymentOrderPay":
			return PaymentCompletion;
		case "PaymentOrderDoc":
			return PaymentApplyDocument;
		case "PaymentOrderCompletion":
			return PaymentView;
		default:
			throw new Error();
	}
}
