"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Instance } from "@/felo/instances/models/Instance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import {
  InspectionMethod,
  inspectionMethod,
} from "@/inspection/models/InspectionMethod";
import { cn } from "@/lib/utils";

import { ids } from "../models/Ids";

function InspectionInfoTable({
	instance,
	numOfInvoices,
	numOfCosts,
}: {
	instance: Instance | undefined;
	numOfInvoices: number;
	numOfCosts: number;
}) {
	const { task } = useTaskContext();

	const isCaseNoInFormData = isFieldInTaskForm(task, ids.inspectionCaseNo);

	const coordinatorName =
		instance?.parameters?.["Assignees"]?.["coordinator"]?.name;
	const customerName = instance?.parameters?.["Assignees"]?.["customer"]?.name;
	const buyerName = instance?.parameters?.["Buyer"]?.name;
	const expertName =
		instance?.parameters?.["Assignees"]?.["technicalExpert"]?.name ||
		instance?.parameters?.["Assignees"]?.["expert"]?.name;
	const managerName = instance?.parameters?.["Assignees"]?.["manager"]?.name;

	if (!instance) return;

	return (
		<div className="col-span-full space-y-2">
			<Card>
				<CardHeader className="py-2">
					<CardTitle className="text-sm">اطلاعات درخواست</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table
						slotProps={{
							root: { className: "border-x-0 border-b-0 rounded-t-none" },
						}}
					>
						<TableHeader>
							<TableRow>
								{!isCaseNoInFormData && (
									<TableHead className="w-36">شماره درخواست</TableHead>
								)}
								<TableHead>نوع درخواست</TableHead>
								{coordinatorName && (
									<TableHead className="w-44">هماهنگ کننده</TableHead>
								)}
								{expertName && <TableHead className="w-44">کارشناس</TableHead>}
								{managerName && <TableHead className="w-44">مدیر</TableHead>}
								{customerName && <TableHead className="w-44">مشتری</TableHead>}
								{buyerName && <TableHead className="w-56">خریدار</TableHead>}
								<TableHead className="w-44">وضعیت فاکتورها</TableHead>
								<TableHead className="w-44">وضعیت هزینه ها</TableHead>
								<TableHead className="w-36">زمان شروع</TableHead>
								<TableHead className="w-36">آخرین بروزرسانی</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow className="whitespace-nowrap">
								{!isCaseNoInFormData && (
									<TableCell>{instance.caseNo}</TableCell>
								)}
								<TableCell>
									<InspectionItemProcess {...instance} />
								</TableCell>
								{coordinatorName && <TableCell>{coordinatorName}</TableCell>}
								{expertName && <TableCell>{expertName}</TableCell>}
								{managerName && <TableCell>{managerName}</TableCell>}
								{customerName && <TableCell>{customerName}</TableCell>}
								{buyerName && <TableCell>{buyerName}</TableCell>}
								<TableCell>
									<InspectionItemInvoicesStatus numOfInvoices={numOfInvoices} />
								</TableCell>
								<TableCell>
									<InspectionItemCostsStatus numOfCosts={numOfCosts} />
								</TableCell>
								<TableCell>
									<InspectionItemTime date={instance.createAt} />
								</TableCell>
								<TableCell>
									<InspectionItemTime date={instance.updateAt} />
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function InspectionItemProcess({
	processName,
	parameters,
}: Pick<Instance, "processName" | "parameters">) {
	const method =
		parameters["InspectionMethod"] &&
		inspectionMethod[parameters["InspectionMethod"] as InspectionMethod];

	return (
		<div className="flex gap-3">
			<div className="flex items-center gap-1">
				<span>{processName}</span>
				{method && <span className="text-xs text-gray-500">({method})</span>}
			</div>
		</div>
	);
}

function InspectionItemInvoicesStatus({
	numOfInvoices,
}: {
	numOfInvoices: number;
}) {
	if (numOfInvoices === -1) {
		return <Spinner loading size="xs" />;
	}

	return (
		<span
			className={cn(
				"rounded-xl bg-green-50 px-2 py-0.5 text-xs text-green-900",
				numOfInvoices > 0 && "bg-red-50 text-red-900",
			)}
		>
			{numOfInvoices === 0
				? "بدون وصول"
				: `دارای ${numOfInvoices} فاکتور نیاز به بررسی`}
		</span>
	);
}

function InspectionItemCostsStatus({ numOfCosts }: { numOfCosts: number }) {
	if (numOfCosts === -1) {
		return <Spinner loading size="xs" />;
	}

	return (
		<span
			className={cn(
				"rounded-xl bg-green-50 px-2 py-0.5 text-xs text-green-900",
				numOfCosts > 0 && "bg-red-50 text-red-900",
			)}
		>
			{numOfCosts === 0
				? "بدون پرداختی"
				: `دارای ${numOfCosts} هزینه نیاز به بررسی`}
		</span>
	);
}

function InspectionItemTime({ date }: { date: Date | undefined }) {
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

export { InspectionInfoTable };
