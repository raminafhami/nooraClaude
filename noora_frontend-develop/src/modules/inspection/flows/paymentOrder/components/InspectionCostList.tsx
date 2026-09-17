"use client";

import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { CostItemPaymentAmount } from "@/financial/costs/components/CostItemPaymentAmount";
import { Cost } from "@/financial/costs/models/Cost";
import { getCostsByPayment } from "@/financial/costs/services/getCostsByPayment";
import { getCostsReportByPayment } from "@/financial/costs/services/getCostsReportByPayment";
import downloadBlob from "@/utils/downloadBlob";

function InspectionCostList() {
	const { task } = useTaskContext();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [inspectionCosts, setInspectionCosts] = useState<Cost[]>();

	useEffect(() => {
		const fetchFn = async () => {
			try {
				const costs = await getCostsByPayment(task.instanceId, {
					populate: ["instance", "personId"],
				});

				setInspectionCosts(costs);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFn();
	}, [task.instanceId]);

	// export
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleExport() {
		try {
			setIsPending(true);

			const blob = await getCostsReportByPayment(task.instanceId);
			await downloadBlob({ blob });
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در دریافت گزارش هزینه ها رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="col-span-full !col-start-1 space-y-3 xl:col-span-10 2xl:col-span-8">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle className="flex gap-2">
						فهرست هزینه ها
						<span className="text-sm text-muted-foreground">(ذینفع)</span>
					</CardTitle>
					<CardNav>
						<Button
							disabled={isPending}
							variant="secondary"
							onClick={handleExport}
						>
							<Spinner loading={isPending} size="xs">
								<FaDownload />
							</Spinner>
							<span>دریافت گزارش</span>
						</Button>
					</CardNav>
				</CardHeader>
				<CardContent className="px-0">
					<Table
						loading={isLoading}
						slotProps={{ root: { className: "rounded-none border-x-0" } }}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-16">#</TableHead>
								<TableHead>ذینفع</TableHead>
								<TableHead className="w-40">دسته بندی</TableHead>
								<TableHead className="w-48">مبلغ</TableHead>
								<TableHead className="w-36">شماره درخواست</TableHead>
								<TableHead className="w-36">نوع بازرسی</TableHead>
								<TableHead className="w-36">وضعیت درخواست</TableHead>
								<TableHead className="w-48">خریدار</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{inspectionCosts?.length ? (
								inspectionCosts.map((cost, index) => (
									<TableRow key={cost.id} className="whitespace-nowrap">
										<TableCell>{index + 1}</TableCell>

										<TableCell>{cost.personName || "-"}</TableCell>

										<TableCell>{cost.title || "-"}</TableCell>

										<TableCell>
											<CostItemPaymentAmount
												cost={cost}
												options={{ percentage: false, method: false }}
											/>
										</TableCell>

										<TableCell>{cost.caseNo ?? "-"}</TableCell>

										<TableCell>{cost.instance?.name ?? "-"}</TableCell>

										<TableCell>
											{cost.instance?.status ? (
												<InstanceStatusBadge
													instance={{
														status: cost.instance.status as InstanceStatus,
													}}
												/>
											) : (
												"-"
											)}
										</TableCell>

										<TableCell>{cost.instance?.buyer?.name ?? "-"}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export default InspectionCostList;
