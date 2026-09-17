import { Metadata } from "next";

import { DashboardClient } from "./_module/DashboardClient";

const metadata: Metadata = {
	title: "Dashboard",
};

function DashboradPage() {
	return <DashboardClient />;
}

export { metadata };
export default DashboradPage;
