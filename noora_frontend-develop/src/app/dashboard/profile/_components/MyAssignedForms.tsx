"use client";

import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loading } from "@/ui/Loader";

import {
	FORM_ASSIGNMENT_FREQUENCY_LABELS,
} from "@/formBuilder/enums/FormAssignmentFrequency";
import {
	FORM_OCCURRENCE_STATUS_LABELS,
} from "@/formBuilder/enums/FormOccurrenceStatus";
import { getMyFormAssignments } from "@/formBuilder/services/getMyFormAssignments";
import { MyFormAssignment } from "@/formBuilder/models/MyFormAssignment";

function MyAssignedForms() {
	const router = useRouter();
	const [assignments, setAssignments] = useState<MyFormAssignment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getMyFormAssignments()
			.then(setAssignments)
			.catch(() => toast.error("خطا در دریافت فرم‌های تخصیص‌یافته."))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <Loading size="sm">در حال بارگزاری...</Loading>;
	}

	return (
		<div className="flex flex-col gap-3">
			<h3 className="text-sm text-muted-foreground">فرم‌های تخصیص‌یافته به من</h3>
			<Table>
				<TableHeader>
					<TableRow className="bg-gray-100 text-right">
						<TableHead className="text-right">عنوان</TableHead>
						<TableHead className="text-right">کد</TableHead>
						<TableHead className="text-right">دسته‌بندی</TableHead>
						<TableHead className="text-right">تناوب</TableHead>
						<TableHead className="text-right">سررسید</TableHead>
						<TableHead className="text-right">وضعیت</TableHead>
						<TableHead className="text-right"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{assignments.length ? (
						assignments.map((row) => (
							<TableRow key={row.assignmentId}>
								<TableCell>{row.form.title}</TableCell>
								<TableCell dir="ltr">{row.form.code}</TableCell>
								<TableCell>{row.form.category?.title ?? "-"}</TableCell>
								<TableCell>
									{FORM_ASSIGNMENT_FREQUENCY_LABELS[row.frequency]}
								</TableCell>
								<TableCell>
									{row.currentOccurrence?.dueDate
										? moment(row.currentOccurrence.dueDate).format(
												"jYYYY/jMM/jDD",
											)
										: "-"}
								</TableCell>
								<TableCell>
									{row.currentOccurrence ? (
										<Badge
											variant={
												row.currentOccurrence.isOverdue
													? "destructive"
													: "secondary"
											}
										>
											{row.currentOccurrence.isOverdue
												? "دارای تأخیر"
												: FORM_OCCURRENCE_STATUS_LABELS[
														row.currentOccurrence.status
													]}
										</Badge>
									) : (
										<Badge variant="outline">آزاد</Badge>
									)}
								</TableCell>
								<TableCell>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() =>
											router.push(`/dashboard/profile/forms/${row.assignmentId}`)
										}
									>
										مشاهده
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={7}>فرمی تخصیص داده نشده است.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export { MyAssignedForms };
