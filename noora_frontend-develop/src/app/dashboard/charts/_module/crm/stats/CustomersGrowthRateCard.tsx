"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa6";

import apiClient from "@/api/client";

import { DataCard } from "../../shared/DataCard";

function CustomersGrowthRateCard() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [value, setValue] = useState<number>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const currentMonthCustomers = async () => {
					const today = moment();
					const firstDayOfMonth = today.clone().startOf("jMonth");

					const searchParams = new URLSearchParams();
					searchParams.set("dateFrom", firstDayOfMonth.format("YYYY-MM-DD"));
					searchParams.set("dateTo", today.format("YYYY-MM-DD"));

					const response = await apiClient.get({
						url: "reports/users",
						searchParams,
					});

					return response.result.count as number;
				};

				const lastMonthCustomers = async () => {
					const firstDayOfMonth = moment()
						.subtract(1, "jMonth")
						.startOf("jMonth");
					const lastDayOfMonth = firstDayOfMonth
						.clone()
						.endOf("jMonth")
						.utc()
						.endOf("day");

					const searchParams = new URLSearchParams();
					searchParams.set("dateFrom", firstDayOfMonth.format("YYYY-MM-DD"));
					searchParams.set("dateTo", lastDayOfMonth.format("YYYY-MM-DD"));

					const response = await apiClient.get({
						url: "reports/users",
						searchParams,
					});

					return response.result.count as number;
				};

				const [currentMonth, lastMonth] = await Promise.all([
					currentMonthCustomers(),
					lastMonthCustomers(),
				]);

				const rateMultiplier = currentMonth < lastMonth ? -1 : 1;
				const ratePercentage =
					currentMonth && lastMonth
						? currentMonth !== lastMonth
							? currentMonth / lastMonth
							: 1
						: 0;
				const rate =
					rateMultiplier *
					(rateMultiplier < 0 ? 1 - ratePercentage : ratePercentage) *
					100;

				setValue(rate);
			} catch (err: any) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	return (
		<DataCard
			color="purple"
			icon={FaChartLine}
			title="نرخ رشد مشتریان نسبت به ماه گذشته"
			value={
				typeof value === "number" ? (
					<span dir="ltr">{value.toFixed(1)}%</span>
				) : null
			}
			loading={isLoading}
		/>
	);
}

export { CustomersGrowthRateCard };
