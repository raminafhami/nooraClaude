"use client";

import { Card } from "@/components/ui/card";

import { PaymentOrderTypesCard } from "./PaymentOrderTypesCard";
import { PeriodicInspectionFinancialNumbersCard } from "./PeriodicInspectionFinancialNumbersCard";
import { PeriodicInspectionInstancesCard } from "./PeriodicInspectionInstancesCard";
import { PeriodicInspectionSalesSettlesCard } from "./PeriodicInspectionSalesSettlesCard";

function FinancialsDashboard() {
	return (
		<div className="grid grid-cols-12 gap-8">
			<Card className="col-span-full xl:col-span-4">
				<PaymentOrderTypesCard />
			</Card>

			<Card className="col-span-full xl:col-span-8">
				<PeriodicInspectionInstancesCard />
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionSalesSettlesCard />
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="همه بازرسی ها"
					definitionKey={[
						"Inspection_Case_COI",
						"Inspection_Case_IC",
						"Inspection_Case_LC",
						"Inspection_Case_Bank_COI",
						"Inspection_Case_SC",
						"CustomsSampling",
						"ProductiveSampling",
						"BoushehrSampling",
						"BandarAbbasSampling",
					]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="بازرسی COI"
					definitionKey={["Inspection_Case_COI"]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="بازرسی IC"
					definitionKey={["Inspection_Case_IC"]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="بازرسی LC"
					definitionKey={["Inspection_Case_LC"]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="بازرسی COI بانکی"
					definitionKey={["Inspection_Case_Bank_COI"]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="قرارداد نظارت"
					definitionKey={["Inspection_Case_SC"]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="تایید اصالت"
					definitionKey={["Inspection_Case_Source"]}
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="نمونه برداری گمرکی"
					definitionKey={["CustomsSampling"]}
					onlyTotal
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="نمونه برداری تولیدی"
					definitionKey={["ProductiveSampling"]}
					onlyTotal
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="نمونه برداری بوشهر"
					definitionKey={["BoushehrSampling"]}
					onlyTotal
				/>
			</Card>

			<Card className="col-span-full">
				<PeriodicInspectionFinancialNumbersCard
					title="نمونه برداری بندرعباس"
					definitionKey={["BandarAbbasSampling"]}
					onlyTotal
				/>
			</Card>
		</div>
	);
}

export { FinancialsDashboard };
