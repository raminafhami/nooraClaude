"use client";

import { memo } from "react";

import { Instance } from "@/felo/instances/models/Instance";
import { LetterList } from "@/secretariat/components/letter-list/LetterList";

interface Props {
	instanceData: Instance;
}

export const PageSecretariat = memo(function PageSecretariat({
	instanceData,
}: Props): React.ReactNode {
	return <LetterList inspectionCaseNo={instanceData?.caseNo as string} />;
});
