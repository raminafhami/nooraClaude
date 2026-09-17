import {
	Legend,
	RadialBar,
	RadialBarChart,
	ResponsiveContainer,
} from "recharts";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
	{
		name: "همه گروه ها",
		uv: 31.47,
		fill: "#8884d8",
	},
	{
		name: "گروه IC",
		uv: 26.69,
		fill: "#83a6ed",
	},
	{
		name: "گروه LC",
		uv: 15.69,
		fill: "#8dd1e1",
	},
	{
		name: "گروه COI",
		uv: 8.22,
		fill: "#82ca9d",
	},
	{
		name: "گروه قرارداد نظارت",
		uv: 8.63,
		fill: "#a4de6c",
	},
	{
		name: "گروه نمونه برداری",
		uv: 2.63,
		fill: "#ffc658",
	},
	// {
	// 	name: "unknow",
	// 	uv: 6.67,
	// 	fill: "#ffc658",
	// },
];

const style = {
	// top: "50%",
	// right: 0,
	// transform: "translate(0, -50%)",
	direction: "rtl",
	lineHeight: "24px",
} as any;

function DepartmentsSalesKpi() {
	return (
		<>
			<CardHeader>
				<CardTitle>KPI فروش گروه های مختلف</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex h-[32rem] items-center" dir="ltr">
					<ResponsiveContainer width="100%" height="100%">
						<RadialBarChart
							cx="50%"
							cy="50%"
							innerRadius="10%"
							outerRadius="80%"
							barSize={10}
							data={data}
						>
							<RadialBar
								// minAngle={15}
								label={{ fill: "#fff", display: "none" }}
								background
								// clockWise
								dataKey="uv"
							/>
							<Legend
								iconSize={10}
								layout="horizontal"
								verticalAlign="bottom"
								align="center"
								wrapperStyle={style}
							/>
						</RadialBarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</>
	);
}

export { DepartmentsSalesKpi };
