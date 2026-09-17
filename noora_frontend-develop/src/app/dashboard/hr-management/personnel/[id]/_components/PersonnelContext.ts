import { createContext } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";

type PersonnelInformation = Personnel;

type PersonnelContextType = {
	personnel: PersonnelInformation;
	fetchPersonnel: (userId: string) => Promise<void>;
};

const PersonnelContext = createContext<PersonnelContextType>(
	{} as PersonnelContextType,
);

export type { PersonnelInformation };
export { PersonnelContext };
