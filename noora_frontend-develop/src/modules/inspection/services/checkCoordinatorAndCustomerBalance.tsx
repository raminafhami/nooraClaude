import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { getInstances } from "@/felo/instances/services/getInstances";
import { isFieldInTaskData } from "@/felo/tasks/utils/isFieldInTaskData";
import { UserLookup } from "@/identity/users/models/UserLookup";
import getUserById from "@/identity/users/services/getUserById";
import { ObjectType } from "@/utils/object/ObjectType";
import { toCurrency } from "@/utils/String";
import { formatString } from "@/utils/string/formatString";

import { InvoicePaymentStatus } from "../models/InvoicePaymentStatus";

type TaskLike = {
	instanceId: string;
	properties: { key: string }[];
	data: ObjectType;
};

async function checkCoordinatorAndCustomerBalance(
	task: TaskLike,
): Promise<void> {
	let coordinator: UserLookup | undefined;
	let customer: UserLookup | undefined;

	if (isFieldInTaskData(task, "Assignees")) {
		customer = task.data?.["Assignees"]?.customer;
		coordinator = task.data?.["Assignees"]?.coordinator;
	} else {
		const instance = await getInstanceById(task.instanceId, ["Assignees"]);
		customer = instance.parameters?.["Assignees"]?.customer;
		coordinator = instance.parameters?.["Assignees"]?.coordinator;
	}

	const [customerBalance, coordinatorBalance] = await Promise.all([
		queryUserDebt(customer?.id, "customer"),
		queryUserDebt(coordinator?.id, "coordinator"),
	]);

	if (typeof customerBalance !== "undefined" && customerBalance < 0) {
		throw new Error(
			formatString(
				"مشتری {0} {1} ریال بیش از سقف اعتبار خود بدهی دارد و صدور گواهی امکان پذیر نیست.",
				customer?.name ?? "",
				toCurrency(Math.abs(customerBalance).toString()),
			),
		);
	} else if (
		typeof coordinatorBalance !== "undefined" &&
		coordinatorBalance < 0
	) {
		throw new Error(
			formatString(
				"هماهنگ کننده {0} {1} ریال بیش از سقف اعتبار خود بدهی دارد و صدور گواهی امکان پذیر نیست.",
				coordinator?.name ?? "",
				toCurrency(Math.abs(coordinatorBalance).toString()),
			),
		);
	}
}

async function queryUserDebt(
	userId: string | undefined,
	assigneeKey: string,
): Promise<number | undefined> {
	if (!userId) return;

	const [userCredit, userDebt] = await Promise.all([
		getUserById(userId).then((user) => user.credit || 0),
		getInstances({
			filters: [
				{ name: "status", value: InstanceStatus.Completed },
				{ name: "processDefinitionKey", value: { $regex: `^Inspection_Case` } },
				{ name: `parameters.Assignees.${assigneeKey}.id`, value: userId },
				{ name: "parameters.InvoicePaymentStatus", value: { $exists: true } },
				{
					name: "parameters.InvoicePaymentStatus",
					// value: {
					// 	$ne: InvoicePaymentStatus.Paid,
					// },
					value: InvoicePaymentStatus.Unpaid,
				},
			],
			props: ["InvoiceTotal"],
		}).then((instances) =>
			instances
				.map((instance) => Number(instance.parameters?.["InvoiceTotal"]) || 0)
				.reduce((acc, curr) => acc + curr, 0),
		),
	]);

	return userCredit - userDebt;
}

export { checkCoordinatorAndCustomerBalance };
