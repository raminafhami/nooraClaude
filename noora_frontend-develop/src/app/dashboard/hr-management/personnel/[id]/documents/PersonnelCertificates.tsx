import moment from "moment-jalaali";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getCertificateFile } from "@/hrm/personnelExpertise/services/getCertificateFile";
import {
	PersonnelCertificateRecord,
	getPersonnelCertificates,
} from "@/hrm/personnelExpertise/services/getPersonnelCertificates";
import FileInput from "@/ui/FileInput";
import { Loading } from "@/ui/Loader";

type Item = PersonnelCertificateRecord & { file?: File };

// "مستندات پرسنل": every certificate uploaded for the person (add-job modal or
// training page) with what was entered for it. Read-only, laid out like the
// documents above.
export function PersonnelCertificates({ userId }: { userId: string }) {
	const [items, setItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const records = await getPersonnelCertificates(userId);
				const withFiles = await Promise.all(
					records.map(async (record) => {
						try {
							const blob = await getCertificateFile(record.id);
							const name = record.filename || `${record.title ?? "certificate"}`;
							return { ...record, file: new File([blob], name, { type: blob.type || record.mimetype }) };
						} catch {
							return { ...record };
						}
					}),
				);
				if (!cancelled) setItems(withFiles);
			} catch {
				if (!cancelled) toast.error("خطایی در دریافت مستندات پرسنل رخ داد!");
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [userId]);

	return (
		<div className="mt-10 space-y-6">
			<div className="h-1 bg-gray-100"></div>
			<div className="text-base font-bold">مستندات پرسنل</div>

			{loading ? (
				<Loading size="sm">درحال دریافت مستندات...</Loading>
			) : items.length === 0 ? (
				<div className="text-sm text-gray-600">
					هنوز گواهی‌ای برای این پرسنل ثبت نشده است.
				</div>
			) : (
				<div className="grid grid-cols-1 gap-x-20 gap-y-8 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12">
					{items.map((item) => (
						<div
							key={item.id}
							className="col-span-full flex flex-col gap-2 xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3"
							data-certificate-id={item.id}
						>
							<label className="text-sm">
								{item.title ?? "(آموزش حذف‌شده)"}:
							</label>
							{item.file ? (
								<div>
									<FileInput setFile={() => undefined} file={item.file} />
								</div>
							) : (
								<div className="text-xs text-red-600">فایل در دسترس نیست</div>
							)}
							<div className="space-y-1 text-xs text-gray-700">
								<div>
									<span className="text-gray-500">سازمان گواهی‌دهنده: </span>
									{item.organizationName || "-"}
								</div>
								<div>
									<span className="text-gray-500">تاریخ دریافت گواهی: </span>
									{item.certificateDate
										? moment(item.certificateDate).format("jYYYY/jMM/jDD")
										: "-"}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
