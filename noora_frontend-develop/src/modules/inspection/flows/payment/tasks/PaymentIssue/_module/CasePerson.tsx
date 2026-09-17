"use client";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { CaseType } from "@/inspection/models/CaseType";

import { ids } from "../../../models/Ids";
import CasePersonBuyer from "./CasePersonBuyer";
import CasePersonUser from "./CasePersonUser";

export default function CasePerson() {
	const {
		task: { data },
	} = useTaskContext();

	return data[ids.caseType] === CaseType.Official ? (
		<CasePersonBuyer />
	) : (
		<CasePersonUser />
	);
}
