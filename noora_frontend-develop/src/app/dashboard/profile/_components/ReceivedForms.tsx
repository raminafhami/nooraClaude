"use client";

import moment from "moment-jalaali";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

import { FormShare } from "@/formBuilder/models/FormShare";
import { getReceivedShares } from "@/formBuilder/services/getReceivedShares";

function ReceivedForms() {
	const router = useRouter();
	const [shares, setShares] = useState<FormShare[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getReceivedShares()
			.then(setShares)
			.catch(() => toast.error("خطا در دریافت فرم‌های دریافتی."))
			.finally(() => setLoading(false));
	}, []);

	if (loading) {
		return <Loading size="sm">در حال بارگزاری...</Loading>;
	}

	return (
		<div className="flex flex-col gap-3">
			<h3 className="text-sm text-muted-foreground">
				فرم‌های دریافتی از دیگران
			</h3>
			<Table>
				<TableHeader>
					<TableRow className="bg-gray-100 text-right">
						<TableHead className="text-right">ارسال‌کننده</TableHead>
						<TableHead className="text-right">پیام</TableHead>
						<TableHead className="text-right">تاریخ ارسال</TableHead>
						<TableHead className="text-right"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{shares.length ? (
						shares.map((share) => (
							<TableRow key={share.id}>
								<TableCell>
									{share.sender
										? `${share.sender.name} ${share.sender.lastname}`
										: "-"}
								</TableCell>
								<TableCell>{share.message || "-"}</TableCell>
								<TableCell>
									{moment(share.createdAt).format("jYYYY/jMM/jDD HH:mm")}
								</TableCell>
								<TableCell>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={() =>
											router.push(`/dashboard/profile/received-forms/${share.id}`)
										}
									>
										مشاهده
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={4}>فرمی دریافت نشده است.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

export { ReceivedForms };
