"use client";

import moment from "moment-jalaali";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loading } from "@/ui/Loader";

import {
	FORM_ASSIGNMENT_FREQUENCY_LABELS,
} from "@/formBuilder/enums/FormAssignmentFrequency";
import { deactivateFormAssignment } from "@/formBuilder/services/deactivateFormAssignment";
import { getFormAssignments } from "@/formBuilder/services/getFormAssignments";
import { FormAssignment } from "@/formBuilder/models/FormAssignment";

function AssignmentsList({ formId, refreshKey }: { formId: string; refreshKey: unknown }) {
	const router = useRouter();
	const [assignments, setAssignments] = useState<FormAssignment[]>([]);
	const [loading, setLoading] = useState(true);

	const load = useCallback(async () => {
		setLoading(true);
		try {
			setAssignments(await getFormAssignments(formId));
		} catch {
			toast.error("خطا در دریافت تخصیص‌ها.");
		} finally {
			setLoading(false);
		}
	}, [formId]);

	useEffect(() => {
		load();
	}, [load, refreshKey]);

	async function handleDeactivate(assignmentId: string) {
		if (!window.confirm("از غیرفعال کردن این تخصیص مطمئن هستید؟")) return;
		try {
			await deactivateFormAssignment(assignmentId);
			toast.success("تخصیص غیرفعال شد.");
			load();
		} catch {
			toast.error("خطا در غیرفعال‌سازی تخصیص.");
		}
	}

	if (loading) {
		return <Loading size="sm">در حال بارگزاری...</Loading>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className="bg-gray-100 text-right">
					<TableHead className="text-right">کارمند</TableHead>
					<TableHead className="text-right">برنامه تکمیل</TableHead>
					<TableHead className="text-right">تاریخ شروع</TableHead>
					<TableHead className="text-right">تاریخ پایان</TableHead>
					<TableHead className="text-right">وضعیت</TableHead>
					<TableHead className="text-right"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{assignments.length ? (
					assignments.map((assignment) => (
						<TableRow
							key={assignment.id}
							className="cursor-pointer hover:bg-gray-50"
							title="مشاهده سابقه تخصیص و فرم‌های تکمیل‌شده"
							onClick={() =>
								router.push(
									`/dashboard/procedure/forms/${formId}/users/${assignment.userId}`,
								)
							}
						>
							<TableCell className="text-primary">
								{assignment.user
									? `${assignment.user.name} ${assignment.user.lastname}`
									: "-"}
							</TableCell>
							<TableCell>
								{FORM_ASSIGNMENT_FREQUENCY_LABELS[assignment.frequency]}
							</TableCell>
							<TableCell>
								{moment(assignment.startDate).format("jYYYY/jMM/jDD")}
							</TableCell>
							<TableCell>
								{assignment.endDate
									? moment(assignment.endDate).format("jYYYY/jMM/jDD")
									: "-"}
							</TableCell>
							<TableCell>
								<Badge variant={assignment.isActive ? "default" : "outline"}>
									{assignment.isActive ? "فعال" : "غیرفعال"}
								</Badge>
							</TableCell>
							<TableCell>
								{assignment.isActive && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											handleDeactivate(assignment.id);
										}}
									>
										غیرفعال‌سازی
									</Button>
								)}
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={6}>تخصیصی ثبت نشده است.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export { AssignmentsList };
