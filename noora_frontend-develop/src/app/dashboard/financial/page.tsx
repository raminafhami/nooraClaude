import {
	FaFileInvoice,
	FaHandHoldingDollar,
	FaLayerGroup,
	FaMoneyBills,
	FaSackDollar,
} from "react-icons/fa6";

import { authorizeByGroups } from "@/auth/utils/authorizeByGroups";
import { extractIdentity } from "@/auth/utils/extractdentity";
import getUniversalSession from "@/auth/utils/getUniversalSession";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsWithUrl } from "@/components/ui/tabs-with-url";
import { TabItemType } from "@/components/ui/tabs.types";
import { getVisibleTabItems } from "@/components/ui/tabs.utils";
import { BudgetCategoryList } from "@/financial/petty-category/components/BudgetCategoryList";
import { Layout } from "@/ui/Layout";

import { CategoriesPage } from "./_module/categories/CategoriesPage";
import { IncomesPage } from "./_module/incomes/IncomesPage";
import { InvoicePayments } from "./_module/InvoicePayments";
import { InvoicesPage } from "./_module/invoices/InvoicesPage";
import FinancialComponent from "./_module/payment-orders/FinancialComponent";
import { PettyCashesPage } from "./_module/petty-cash/PettyCashesPage";
import { PettyCostsPage } from "./_module/petty-cost/PettyCostsPage";

const items: TabItemType[] = [
	{
		value: "invoices",
		title: "فاکتورها",
		icon: FaFileInvoice,
		component: <InvoicesPage />,
	},
	{
		value: "invoice-payments",
		title: "پرداختی فاکتورها",
		icon: FaSackDollar,
		component: <InvoicePayments />,
		authorize: authorizeByGroups([
			"ceo",
			"financial-expert",
			"financial-assistant",
		]),
	},
	{
		value: "payment-orders",
		title: "پرداخت ها",
		icon: FaHandHoldingDollar,
		component: <FinancialComponent />,
		authorize: authorizeByGroups([
			"ceo",
			"financial-expert",
			"financial-assistant",
		]),
	},
	{
		value: "incomes",
		title: "درآمدهای آزاد",
		icon: FaMoneyBills,
		component: <IncomesPage />,
	},
	{
		value: "categories",
		title: "دسته بندی ها",
		icon: FaLayerGroup,
		component: <CategoriesPage />,
		authorize: authorizeByGroups([
			"ceo",
			"financial-expert",
			"financial-assistant",
		]),
	},
	{
		value: "petty-cost",
		title: "هزینه ها",
		icon: FaMoneyBills,
		component: <PettyCostsPage />,
	},
	{
		value: "petty-cash",
		title: "تنخواه ها",
		icon: FaMoneyBills,
		component: <PettyCashesPage />,
		authorize: authorizeByGroups([
			"ceo",
			"financial-expert",
			"financial-assistant",
		]),
	},
	{
		value: "petty-category",
		title: "مدیریت بودجه",
		icon: FaMoneyBills,
		component: <BudgetCategoryList />,
		authorize: authorizeByGroups([
			"ceo",
			"financial-expert",
			"financial-assistant",
		]),
	},
];

function FinancialsPage() {
	const { accessToken } = getUniversalSession();
	const identity = extractIdentity(accessToken);

	const visibleItems = getVisibleTabItems(items, { identity });

	if (!visibleItems.length) {
		return;
	}

	return (
		<Layout.Root>
			<Layout.Head title="مالی" />
			<Layout.Content>
				<TabsWithUrl defaultValue={visibleItems[0].value}>
					<TabsList>
						{visibleItems.map((item) => (
							<TabsTrigger
								key={item.value}
								className="gap-1.5"
								value={item.value}
							>
								{item.icon ? <item.icon className="text-base" /> : undefined}
								{item.title}
							</TabsTrigger>
						))}
					</TabsList>

					{visibleItems.map((item) => (
						<TabsContent key={item.value} value={item.value}>
							{item.component}
						</TabsContent>
					))}
				</TabsWithUrl>
			</Layout.Content>
		</Layout.Root>
	);
}

export default FinancialsPage;
