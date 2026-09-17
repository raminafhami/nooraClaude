"use client";

import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";

import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";
import {
	inspectionMethod,
	InspectionMethod,
} from "@/inspection/models/InspectionMethod";
import {
	invoicePaymentStatus,
	InvoicePaymentStatus,
} from "@/inspection/models/InvoicePaymentStatus";
import { getInspectionCaseUrl } from "@/inspection/utils/getInspectionCaseUrl";
import { cn } from "@/lib/utils";
import { ObjectType } from "@/utils/object/ObjectType";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

function BuyerRequestsTableRow({
	instance,
	index,
}: {
	instance: Instance;
	index: number;
}) {
	const router = useRouter();

	function handleInspectionRedirect(
		instance: Pick<Instance, "id" | "processKey">,
	) {
		const url = getInspectionCaseUrl(instance);
		router.push(getDynamicUrl(url));
	}

	return (
		<TableRow
			className="cursor-pointer whitespace-nowrap"
			onClick={() => handleInspectionRedirect(instance)}
		>
			<TableCell>{index + 1}</TableCell>
			<TableCell>{instance.caseNo}</TableCell>
			<TableCell>
				<RequestProcess
					processName={instance.processName}
					status={instance.status}
					data={instance.parameters}
				/>
			</TableCell>
			<TableCell>{instance.phase?.title ?? "-"}</TableCell>
			<TableCell>
				<RequestPaymentStatus
					status={instance.parameters["InvoicePaymentStatus"]}
				/>
			</TableCell>
			<TableCell>
				<RequestTime date={instance.createAt} />
			</TableCell>
			<TableCell>
				<RequestTime date={instance.updateAt} />
			</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<Tooltip>
							<TooltipTrigger asChild>
								<DynamicLink
									className="h-full"
									href={getInspectionCaseUrl(instance)}
								>
									<TableAction className="hover:text-blue-500">
										<FaEye />
									</TableAction>
								</DynamicLink>
							</TooltipTrigger>
							<TooltipContent>مشاهده درخواست</TooltipContent>
						</Tooltip>
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

function RequestProcess({
	processName,
	status,
	data,
}: {
	processName: string;
	status: InstanceStatus | undefined;
	data: ObjectType;
}) {
	const method =
		data["InspectionMethod"] &&
		inspectionMethod[data["InspectionMethod"] as InspectionMethod];

	return (
		<div className="flex gap-3">
			<div className="flex items-center gap-1">
				<span>{processName}</span>
				{method && <span className="text-xs text-gray-500">({method})</span>}
			</div>
			<InstanceStatusBadge instance={{ status }} />
		</div>
	);
}

function RequestPaymentStatus({
	status,
}: {
	status: InvoicePaymentStatus | undefined;
}) {
	if (!status) {
		return "-";
	}

	return (
		<span
			className={cn(
				"rounded-xl bg-gray-100 px-2 py-0.5 text-xs text-gray-900",
				status === InvoicePaymentStatus.Paid && "bg-green-50 text-green-900",
				status === InvoicePaymentStatus.PartiallyPaid &&
					"bg-orange-50 text-orange-900",
				status === InvoicePaymentStatus.Pending &&
					"bg-yellow-50 text-yellow-900",
			)}
		>
			{invoicePaymentStatus[status]}
		</span>
	);
}

function RequestTime({ date }: { date: Date | undefined }) {
	if (!date) {
		return "-";
	}

	return (
		<div className="space-y-2 text-xs">
			<div>
				{date.toLocaleTimeString("fa-IR-u-nu-latn", {
					calendar: "persian",
					hour: "2-digit",
					minute: "2-digit",
				})}
				{"، "}
				{date.toLocaleDateString("fa-IR-u-nu-latn", {
					calendar: "persian",
					weekday: "long",
				})}
			</div>
			<div>
				{date.toLocaleDateString("fa-IR-u-nu-latn", {
					calendar: "persian",
					dateStyle: "long",
				})}
			</div>
		</div>
	);
}

export { BuyerRequestsTableRow };
