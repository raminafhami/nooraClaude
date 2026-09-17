"use client";

import {
	FaChalkboardUser,
	FaDoorOpen,
	FaUserClock,
	FaUsers,
} from "react-icons/fa6";

import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";

import { DepartmentalHeadcountComparisonBarChart } from "./DepartmentalHeadcountComparisonBarChart";
import { DepartmentsSalesKpi } from "./DepartmentsSalesKpi";
import { ProcessesSlaCard } from "./tables/ProcessesSlaCard";
import { UsersSlaCard } from "./tables/UsersSlaCard";

function HrDashboard() {
	return (
		<div className="grid grid-cols-12 gap-3 2xl:gap-8">
			<Card className="col-span-2 col-start-1 h-24 2xl:h-32">
				<div className="flex h-full gap-6 p-3 2xl:p-8">
					<div className="flex h-full w-16 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-500">
						<FaUsers />
					</div>
					<div className="flex flex-col justify-between">
						<div className="text-sm text-muted-foreground">تعداد کل پرسنل</div>
						<div className="text-sm">78</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-2 h-24 2xl:h-32">
				<div className="flex h-full gap-6 p-3 2xl:p-8">
					<div className="flex h-full w-16 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-2xl text-purple-500">
						<FaChalkboardUser />
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="text-sm text-muted-foreground">جلسات آموزشی</div>
						<div className="text-sm">9</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-2 h-24 2xl:h-32">
				<div className="flex h-full gap-6 p-3 2xl:p-8">
					<div className="flex h-full w-16 items-center justify-center rounded-xl bg-red-100 text-2xl text-red-500">
						<FaUserClock />
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="text-sm text-muted-foreground">غیبت ها</div>
						<div className="text-sm">2</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-2 h-24 2xl:h-32">
				<div className="flex h-full gap-6 p-3 2xl:p-8">
					<div className="flex h-full w-16 items-center justify-center rounded-xl bg-cyan-100 text-2xl text-cyan-500">
						<FaDoorOpen />
					</div>
					<div className="flex flex-col justify-between gap-1">
						<div className="text-sm text-muted-foreground">
							نرخ ترک کارمندان
						</div>
						<div className="text-sm">5%</div>
					</div>
				</div>
			</Card>

			<Card className="col-span-4 row-span-2">
				<DepartmentsSalesKpi />
			</Card>

			<Card className="col-span-8">
				<CardHeader orientation="horizontal">
					<CardTitle>تعداد پرسنل بر اساس بخش</CardTitle>
					<CardNav>
						<div className="text-muted-foreground">دو سال اخیر</div>
					</CardNav>
				</CardHeader>
				<CardContent>
					<div className="flex h-[19rem] items-center justify-center 2xl:h-[32rem]">
						<DepartmentalHeadcountComparisonBarChart />
					</div>
				</CardContent>
			</Card>

			<ProcessesSlaCard />
			<UsersSlaCard />
		</div>
	);
}

export { HrDashboard };
