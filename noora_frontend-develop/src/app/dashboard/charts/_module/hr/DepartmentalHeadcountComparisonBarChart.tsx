import moment from "moment-jalaali"; // For Shamsi date conversion
import React from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Define types for department and headcount data
interface Department {
	id: string;
	name: string;
}

interface HeadcountData {
	date: string;
	headcounts: Record<string, number>; // { departmentId: headcountNumber }
}

// Sample department data with the specified names
const departments: Department[] = [
	{ id: "1", name: "بازرسی" }, // Combined بازرسی IC and بازرسی COI
	{ id: "2", name: "بازاریابی" },
	{ id: "3", name: "مالی" },
	{ id: "4", name: "سایر" },
];

// Improved static colors for the bars (distinct colors)
const departmentColors = [
	"#E63946", // Combined بازرسی (Red)
	"#2A9D8F", // بازاریابی (Teal)
	"#F77F00", // مالی (Orange)
	"#F1C40F", // سایر (Bright Yellow)
];

// Generate headcount data for the past two years (24 months)
const generateHeadcountData = (): HeadcountData[] => {
	const headcountData: HeadcountData[] = [];
	const today = moment(); // Use moment-jalaali for Shamsi dates

	// Set initial total and current total headcount values
	const initialTotal = 50; // Total for the first month (24 months ago)
	const currentTotal = 78; // Total for the current month

	// Define base headcounts for the first month (24 months ago)
	const initialHeadcounts = [
		Math.floor(initialTotal * 0.6), // بازرسی ~ 30 (combined)
		Math.floor(initialTotal * 0.1), // بازاریابی ~ 5
		Math.floor(initialTotal * 0.1), // مالی ~ 5
		Math.floor(initialTotal * 0.2), // سایر ~ 10
	];

	// Define headcounts for the current month (0 months ago)
	const currentHeadcounts = [
		Math.floor(currentTotal * 0.6), // بازرسی ~ 47
		Math.floor(currentTotal * 0.1), // بازاریابی ~ 8
		Math.floor(currentTotal * 0.05), // مالی ~ 4
		Math.floor(currentTotal * 0.25), // سایر ~ 19
	];

	// Generate headcount data for each month
	for (let i = 0; i < 24; i++) {
		const date = today.clone().subtract(23 - i, "months"); // Clone and subtract months
		const formattedDate = date.format("jYYYY/jMM"); // Format date to Shamsi

		const headcounts: Record<string, number> = {};

		// For the current month
		if (i === 23) {
			departments.forEach((department, index) => {
				headcounts[department.id] = currentHeadcounts[index];
			});
		}
		// For the initial month
		else if (i === 0) {
			departments.forEach((department, index) => {
				headcounts[department.id] = initialHeadcounts[index];
			});
		} else {
			// Gradually interpolate the values between initial and current headcounts
			departments.forEach((department, index) => {
				const growthRate = i / 23; // Gradual growth rate

				// Add small fluctuations for بازاریابی and مالی
				let fluctuation = 0;
				if (department.id === "2") {
					// بازاریابی
					fluctuation = Math.round(Math.random() * 2 - 1); // Fluctuate by -1 to 1
				} else if (department.id === "3") {
					// مالی
					fluctuation = Math.round(Math.random() * 2 - 1); // Fluctuate by -1 to 1
				}

				const interpolatedHeadcount = Math.floor(
					initialHeadcounts[index] +
						(currentHeadcounts[index] - initialHeadcounts[index]) * growthRate +
						fluctuation,
				);
				headcounts[department.id] = interpolatedHeadcount;
			});
		}

		headcountData.push({ date: formattedDate, headcounts });
	}

	return headcountData;
};

// Create the random headcount data
const data = generateHeadcountData();

// Custom tooltip props type
interface CustomTooltipProps {
	active?: boolean;
	payload?: { payload: HeadcountData }[];
}

// Custom tooltip component
function CustomTooltip({ active, payload }: CustomTooltipProps) {
	if (active && payload && payload.length) {
		return (
			<div
				style={{
					backgroundColor: "white",
					border: "1px solid #ccc",
					padding: "10px",
				}}
			>
				<p>{`ماه: ${payload[0].payload.date}`}</p>
				{departments.map((department) => (
					<p key={department.id}>{`${department.name}: ${
						payload[0].payload.headcounts[department.id] || 0
					}`}</p>
				))}
			</div>
		);
	}

	return null;
}

function DepartmentalHeadcountComparisonBarChart() {
	return (
		<ResponsiveContainer width="100%" height="100%" minHeight={304}>
			<BarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="date" tickMargin={8} />
				<YAxis
					orientation="right"
					tickLine={false}
					axisLine={false}
					tickMargin={32} // Adjusted tick margin
				/>
				<Tooltip content={<CustomTooltip />} />
				<Legend />
				{departments.map((department, index) => (
					<Bar
						key={department.id}
						dataKey={`headcounts.${department.id}`}
						name={department.name}
						fill={departmentColors[index]} // Use the improved static colors
						stackId="a" // Stack bars on top of each other
					/>
				))}
			</BarChart>
		</ResponsiveContainer>
	);
}

export { DepartmentalHeadcountComparisonBarChart };
