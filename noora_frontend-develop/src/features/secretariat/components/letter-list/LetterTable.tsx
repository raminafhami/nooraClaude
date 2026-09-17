"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Instance } from "@/felo/instances/models/Instance";

import { LetterItem } from "./LetterItem";
import { LetterV1Item } from "./LetterV1Item";

function LetterTable({
	data,
	loading,
	pagination,
	offset,
}: {
	data: Instance[];
	loading: boolean;
	pagination: React.ReactNode;
	offset: number;
}) {
	return (
		<Card>
			<CardContent className="px-0 pt-6">
				<Table
					loading={loading}
					pagination={pagination}
					slotProps={{ root: { className: "rounded-none border-x-0" } }}
				>
					<TableHeader>
						<TableRow className="whitespace-nowrap">
							<TableHead className="w-20">#</TableHead>
							<TableHead className="w-36">شماره نامه</TableHead>
							<TableHead>موضوع نامه</TableHead>
							<TableHead className="w-60">ارسال کننده</TableHead>
							<TableHead className="w-60">تایید کننده</TableHead>
							<TableHead className="w-36">فایل بازرسی</TableHead>
							<TableHead className="w-32">پیروان</TableHead>
							<TableHead className="w-40">تاریخ ایجاد</TableHead>
							<TableHead className="w-40">آخرین بروزرسانی</TableHead>
							<TableHead className="w-32">عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.length ? (
							data.map((instance, index) => {
								const Comp =
									instance.processKey === "Secretariat_Letter_Outgoing"
										? LetterItem
										: LetterV1Item;

								return (
									<Comp
										key={instance.id}
										instance={instance}
										index={offset + index}
									/>
								);
							})
						) : (
							<TableRow>
								<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export { LetterTable };
