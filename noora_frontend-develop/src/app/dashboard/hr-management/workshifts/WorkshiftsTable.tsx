import { memo, useEffect, useState } from "react";
import { FaRotate } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Workshift } from "@/hrm/attendance/models/Workshift";
import { getWorkshifts } from "@/hrm/attendance/services/getWorkshifts";
import { getTimeString } from "@/time/getTimeString";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

export const WorkshiftsTable = memo(function WorkshiftsTable({
	workshifts,
	onWorkshiftsFetch,
}: {
	workshifts: Workshift[];
	onWorkshiftsFetch: (workshifts: Workshift[]) => void;
}): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	async function loadWorkshifts() {
		setLoading(true);

		try {
			const workshifts = await getWorkshifts();

			setError(null);
			onWorkshiftsFetch(workshifts);
		} catch (err: any) {
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadWorkshifts();
	}, [onWorkshiftsFetch]);

	return (
		<div className="col-span-2 space-y-6">
			<Head.Root className="gap-x-2">
				<Head.Title text="لیست شیفت های کاری">
					{(workshifts.length > 0 || error) && (
						<>
							<Button
								className="w-fit"
								disabled={isLoading}
								variant="link"
								onClick={loadWorkshifts}
							>
								{isLoading ? (
									<Loading horizontalPlacement="center" size="sm" />
								) : (
									<FaRotate />
								)}
							</Button>
						</>
					)}
				</Head.Title>
			</Head.Root>
			{workshifts.length > 0 || (!isLoading && !error) ? (
				<Panel.Root>
					<Table.Root>
						<Table.Head>
							<Table.Row className="bg-gray-100 text-right">
								<Table.Cell as="th" className="w-14">
									ردیف
								</Table.Cell>
								<Table.Cell as="th" className="w-36">
									نام شیفت
								</Table.Cell>
								<Table.Cell as="th">زمان شروع</Table.Cell>
								<Table.Cell as="th">زمان پایان</Table.Cell>
								<Table.Cell as="th">شناوری</Table.Cell>
								<Table.Cell as="th">اضافه کاری قانونی</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{workshifts.length > 0 &&
								workshifts.map((workshift: Workshift, index: number) => (
									<Table.Row key={workshift.id}>
										<Table.Cell className="text-center">{index + 1}</Table.Cell>
										<Table.Cell>{workshift?.title}</Table.Cell>
										<Table.Cell>
											{getTimeString(workshift.entryTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(workshift.exitTime, false)}
										</Table.Cell>
										<Table.Cell>
											{getTimeString(workshift.flexible, false)}
										</Table.Cell>
										<Table.Cell>
											{workshift?.legalExtra &&
												getTimeString(workshift?.legalExtra, false)}
										</Table.Cell>
									</Table.Row>
								))}
						</Table.Body>
					</Table.Root>
				</Panel.Root>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<Loading size="sm" verticalPlacement="start">
					در حال دریافت اطلاعات...
				</Loading>
			)}
		</div>
	);
});
