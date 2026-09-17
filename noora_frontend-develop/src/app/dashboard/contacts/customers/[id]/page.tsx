import { Metadata } from "next";
import { redirect } from "next/navigation";
import {
	FaFileInvoiceDollar,
	FaInfo,
	FaLeftLong,
	FaUsersGear,
} from "react-icons/fa6";

import { authorizeByGroups } from "@/auth/utils/authorizeByGroups";
import { extractIdentity } from "@/auth/utils/extractdentity";
import getUniversalSession from "@/auth/utils/getUniversalSession";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsWithUrl } from "@/components/ui/tabs-with-url";
import { TabItemType } from "@/components/ui/tabs.types";
import { getVisibleTabItems } from "@/components/ui/tabs.utils";
import PaymentRulesWidget from "@/financial/payment-rules/components/PaymentRulesWidget";
import { UserBankInfoList } from "@/identity/users/components/UserBankInfoList";
import { User } from "@/identity/users/models/User";
import { UserType } from "@/identity/users/models/UserType";
import getUserById from "@/identity/users/services/getUserById";
import { Layout } from "@/ui/Layout";

import { CustomerActivitiesWidget } from "./_module/activities/CustomerActivitiesWidget";
import { CustomerProvider } from "./_module/CustomerContext";
import { CustomerInfoWidget } from "./_module/info/CustomerInfoWidget";
import { CustomerRecord } from "./_module/record/CustomerRecord";
import { RelationsPage } from "./_module/relations/RelationsPage";
import { CustomerRequestsWidget } from "./_module/requests/CustomerRequestsWidget";

const metadata: Metadata = {
	title: "Customer Details",
};

async function CustomerDetailsPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	const { accessToken } = getUniversalSession();
	const identity = extractIdentity(accessToken)!;

	let customer: User;
	try {
		customer = await getUserById(id);

		const hasInvalidType = customer.type !== UserType.Public;
		const hasInvalidBranch =
			!identity.groups.includes("customers-manager") &&
			identity.branchId &&
			customer.branchId !== identity.branchId;

		if (hasInvalidType || hasInvalidBranch)
			throw new Error("customer is not found.");
	} catch (err: any) {
		console.error(err?.message);
		redirect("/dashboard/contacts/customers");
	}

	const items: TabItemType[] = [
		{
			value: "info",
			title: "اطلاعات",
			icon: FaInfo,
			component: (
				<div className="grid grid-cols-12 gap-6">
					<div className="col-span-full !col-start-1 space-y-6 xl:col-span-8">
						<CustomerInfoWidget />
						<UserBankInfoList id={id} />
						<CustomerRequestsWidget />
					</div>
					<div className="col-span-full col-start-1 space-y-6 xl:col-span-4">
						<CustomerRecord />
						<CustomerActivitiesWidget />
					</div>
				</div>
			),
		},
		{
			value: "relations",
			title: "ارتباط ها",
			icon: FaUsersGear,
			component: <RelationsPage />,
			authorize: authorizeByGroups(["customers-manager", "branch-manager"]),
		},
		{
			value: "payment-rules",
			title: "قوانین پرداخت",
			icon: FaFileInvoiceDollar,
			component: (
				<PaymentRulesWidget
					userId={id}
					service="liaison"
					conditions={{
						buyer: true,
						inspectionType: true,
						caseType: true,
						inspectionMethod: true,
					}}
				/>
			),
			authorize: authorizeByGroups(["customers-manager", "branch-manager"]),
		},
	];

	const visibleItems = getVisibleTabItems(items, { identity });

	if (!visibleItems.length) return;

	return (
		<Layout.Root>
			<Layout.Head title={`مدیریت مشتری: ${customer.fullname}`}>
				<div className="sm:ms-auto">
					<DynamicLink href="/dashboard/contacts?tab=customers">
						<Button>
							<FaLeftLong />
							<span>بازگشت به لیست</span>
						</Button>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<CustomerProvider initialValue={customer}>
					<TabsWithUrl defaultValue={visibleItems[0].value}>
						<TabsList>
							{visibleItems.map((item) => (
								<TabsTrigger key={item.value} value={item.value}>
									{item.icon ? <item.icon /> : undefined}
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
				</CustomerProvider>
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default CustomerDetailsPage;
