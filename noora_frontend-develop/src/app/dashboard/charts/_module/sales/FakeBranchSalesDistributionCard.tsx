import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from "recharts";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
	{
		subject: "دفتر مرکزی",
		A: 110,
		fullMark: 150,
	},
	{
		subject: "شهریار",
		A: 98,
		fullMark: 150,
	},
	{
		subject: "قزوین",
		A: 86,
		fullMark: 150,
	},
	{
		subject: "بندرعباس",
		A: 99,
		fullMark: 150,
	},
	{
		subject: "بوشهر",
		A: 85,
		fullMark: 150,
	},
	{
		subject: "همدان",
		A: 65,
		fullMark: 150,
	},
];

function FakeBranchSalesDistributionCard() {
	return (
		<>
			<CardHeader>
				<CardTitle>میزان پراکندگی فروش شعب</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex h-[34rem] items-center" dir="ltr">
					<ResponsiveContainer width="100%" height="100%">
						<RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
							<PolarGrid />
							<PolarAngleAxis dataKey="subject" />
							<PolarRadiusAxis />
							<Radar
								name="Mike"
								dataKey="A"
								stroke="#8884d8"
								fill="#8884d8"
								fillOpacity={0.6}
							/>
						</RadarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</>
	);
}

export { FakeBranchSalesDistributionCard };
