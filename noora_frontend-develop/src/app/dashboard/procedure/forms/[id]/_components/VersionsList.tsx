"use client";

import { useEffect, useState } from "react";
import moment from "moment-jalaali";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loading } from "@/ui/Loader";

import { FormVersionStatus } from "@/formBuilder/enums/FormVersionStatus";
import {
	FormVersionListItem,
	getFormVersions,
} from "@/formBuilder/services/getFormVersions";

const VERSION_STATUS_LABEL: Record<FormVersionStatus, string> = {
	[FormVersionStatus.Draft]: "پیش‌نویس",
	[FormVersionStatus.Published]: "منتشرشده",
};

function VersionsList({ formId, refreshKey }: { formId: string; refreshKey: unknown }) {
	const [versions, setVersions] = useState<FormVersionListItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		getFormVersions(formId)
			.then(setVersions)
			.finally(() => setLoading(false));
	}, [formId, refreshKey]);

	if (loading) {
		return <Loading size="sm">در حال بارگزاری...</Loading>;
	}

	return (
		<Table>
			<TableHeader>
				<TableRow className="bg-gray-100 text-right">
					<TableHead className="text-right">نسخه</TableHead>
					<TableHead className="text-right">وضعیت</TableHead>
					<TableHead className="text-right">تاریخ انتشار</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{versions.length ? (
					versions.map((version) => (
						<TableRow key={version.id}>
							<TableCell>{version.versionNo}</TableCell>
							<TableCell>{VERSION_STATUS_LABEL[version.status]}</TableCell>
							<TableCell>
								{version.publishedAt
									? moment(version.publishedAt).format("jYYYY/jMM/jDD")
									: "-"}
							</TableCell>
						</TableRow>
					))
				) : (
					<TableRow>
						<TableCell colSpan={3}>نسخه‌ای ثبت نشده است.</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}

export { VersionsList };
