"use client";

import {
  FaChartLine,
  FaDollarSign,
  FaFaceSmile,
  FaUserPlus,
} from "react-icons/fa6";

import { Card } from "@/components/ui/card";

import { BranchesDebtsRankCard } from "./BranchesDebtsRankCard";
import { BranchesSalesDistributionInPieCard } from "./BranchesSalesDistributionInPieCard";
import { CoordinatorsSettledRankCard } from "./CoordinatorsSettledRankCard";
import { CustomersDebtsRankCard } from "./CustomersDebtsRankCard";
import { FakeBranchSalesDistributionCard } from "./FakeBranchSalesDistributionCard";
import { MarketersDebtsRankCard } from "./MarketersDebtsRankCard";
import { MarketersSalesRankCard } from "./MarketersSalesRankCard";

function SalesDashboard() {
	return (
		<div className="grid grid-cols-12 gap-3 2xl:gap-8">
			<Card className="col-span-2 h-28 2xl:h-32">
				<div className="flex h-full gap-6 p-4 2xl:p-8">
					<div className="flex h-full w-16 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-500">
						<FaDollarSign />
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="text-sm text-muted-foreground">مجموع فروش</div>
						<div className="text-sm">12 میلیارد ریال</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-2 h-28 2xl:h-32">
				<div className="flex h-full gap-6 p-4 2xl:p-8">
					<div className="flex h-full w-16 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-2xl text-purple-500">
						<FaChartLine />
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="text-sm text-muted-foreground">رشد فروش</div>
						<div className="text-sm">15%</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-2 h-28 2xl:h-32">
				<div className="flex h-full gap-6 p-4 2xl:p-8">
					<div className="flex h-full w-16 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl text-red-500">
						<FaUserPlus />
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="text-sm text-muted-foreground">مشتریان جدید</div>
						<div className="text-sm">17</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-2 h-28 2xl:h-32">
				<div className="flex h-full gap-6 p-4 2xl:p-8">
					<div className="flex h-full w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-2xl text-cyan-500">
						<FaFaceSmile />
					</div>
					<div className="flex flex-col justify-between">
						<div className="text-muted-foreground">نرخ متوسط رضایت مشتری</div>
						<div className="text-sm">94%</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-4 row-span-2">
				<BranchesSalesDistributionInPieCard />
			</Card>

			<Card className="col-span-8 col-start-1 flex min-h-[38rem] flex-col">
				<MarketersSalesRankCard />
			</Card>

			<Card className="col-span-8 col-start-1 flex min-h-[38rem] flex-col">
				<CoordinatorsSettledRankCard />
			</Card>

			<Card className="col-span-4">
				<FakeBranchSalesDistributionCard />
			</Card>

			<Card className="col-span-8 col-start-1 flex min-h-[38rem] flex-col">
				<CustomersDebtsRankCard />
			</Card>

			<Card className="col-span-8 col-start-1 flex min-h-[38rem] flex-col">
				<MarketersDebtsRankCard />
			</Card>

			<Card className="col-span-8 col-start-1 flex flex-col">
				<BranchesDebtsRankCard />
			</Card>
		</div>
	);
}

export { SalesDashboard };
