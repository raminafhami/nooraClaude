"use client";

import { AiWidget } from "./widgets/AiWidget";
import { KpiInfo } from "./widgets/KpiInfo";
import { NotesWidget } from "./widgets/NotesWidget";
import { NotificationsWidget } from "./widgets/NotificationsWidget";
import { PersonnelContactList } from "./widgets/PersonnelContactList";
import { TicketsWidget } from "./widgets/TicketsWidget";
import { TopThree } from "./widgets/TopThree";
import { WelcomeBoard } from "./widgets/WelcomeBoard";
import { WelcomeBoardFullWidth } from "./widgets/WelcomeBoardFullWidth";

function DashboardClient() {
	return (
		<div className="h-full space-y-5 pb-5">
			<div className="grid grid-cols-12 gap-5">
				{/* <WelcomeBoardFullWidth /> */}
				<WelcomeBoard />
				<TopThree />
				<KpiInfo />
			</div>
			<div className="grid grid-cols-12 gap-5">
				<NotesWidget />
				<TicketsWidget />
			</div>
			<div className="grid grid-cols-12 gap-5">
				<AiWidget />
				<PersonnelContactList />
				<NotificationsWidget />
			</div>
		</div>
	);
}

export { DashboardClient };
