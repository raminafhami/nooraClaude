"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import PaymentRulesWidget from "@/financial/payment-rules/components/PaymentRulesWidget";
import { PersonnelInfo } from "@/hrm/personnel/components/personnel-info/PersonnelInfo";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { Loading } from "@/ui/Loader";

import { Documents } from "../documents/Documents";
import { Jobs } from "../jobs/Jobs";
import { LoginSettings } from "../loginSettings/LoginSettings";
import { PersonnelContext, PersonnelInformation } from "./PersonnelContext";
import { PersonnelNavigation } from "./PersonnelNavigation";
import usePersonnelContext from "./usePersonnelContext";

export type PersonnelSection =
	| "information"
	| "jobs"
	| "documents"
	| "loginSettings"
	| "payment-rules";

export function PersonnelWidget({ userId }: { userId: string }) {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [personnel, setPersonnel] = useState<PersonnelInformation | null>(null);

	const loadPersonnel = useCallback(async () => {
		try {
			const personnel = await getPersonnelById(userId, ["user", "jobs"]);
			setPersonnel(personnel as PersonnelInformation);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		loadPersonnel();
	}, [loadPersonnel]);

	const searchParams = useSearchParams();

	const [section, setSection] = useState<PersonnelSection>(
		(searchParams.get("section") as PersonnelSection) || "information",
	);

	function handleSectionChange(section: PersonnelSection) {
		setSection(section);
	}

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!personnel) {
		return <div>مشکلی در دریافت اطلاعات پرسنل رخ داده است.</div>;
	}

	const personnelContextValue = {
		personnel,
		fetchPersonnel: loadPersonnel,
	};

	return (
		<PersonnelContext.Provider value={personnelContextValue}>
			<PersonnelNavigation section={section} onChange={handleSectionChange} />
			<Section section={section} />
		</PersonnelContext.Provider>
	);
}

function Section({ section }: { section: PersonnelSection }) {
	const { personnel, fetchPersonnel } = usePersonnelContext();

	switch (section) {
		case "information":
			return (
				<PersonnelInfo
					parentPath="hr-management"
					personnel={personnel}
					onChange={fetchPersonnel.bind(null, personnel.userId)}
				/>
			);
		case "loginSettings":
			return <LoginSettings />;
		case "jobs":
			return <Jobs />;
		case "documents":
			return <Documents />;
		case "payment-rules":
			return (
				<PaymentRulesWidget
					userId={personnel.userId}
					service="personnel"
					conditions={{ inspectionType: true, role: true }}
				/>
			);
		default:
			return <></>;
	}
}
