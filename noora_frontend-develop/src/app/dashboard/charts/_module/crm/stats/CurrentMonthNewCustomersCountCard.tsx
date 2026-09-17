"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { FaPersonCirclePlus } from "react-icons/fa6";

import apiClient from "@/api/client";

import { DataCard } from "../../shared/DataCard";

function CurrentMonthNewCustomersCountCard() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [value, setValue] = useState<number>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const today = moment();
				const firstDayOfMonth = today.clone().startOf("jMonth");

				const searchParams = new URLSearchParams();
				searchParams.set("dateFrom", firstDayOfMonth.format("YYYY-MM-DD"));
				searchParams.set("dateTo", today.format("YYYY-MM-DD"));

				const response = await apiClient.get({
					url: "reports/users",
					searchParams,
				});

				setValue(response.result.count);
			} catch (err: any) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	return (
		<DataCard
			color="blue"
			icon={FaPersonCirclePlus}
			title="مشتریان افزوده شده ماه جاری"
			value={typeof value !== "undefined" ? `${value} نفر` : undefined}
			loading={isLoading}
		/>
	);
}

export { CurrentMonthNewCustomersCountCard };
