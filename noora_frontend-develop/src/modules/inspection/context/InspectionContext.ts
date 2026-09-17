"use client";

import { createContext, useContext } from "react";

import { Instance } from "@/felo/instances/models/Instance";

interface InspectionContextType {
	instance: Instance;
	onInstanceUpdate: (parameters: any) => void;
}

export const InspectionContext = createContext<InspectionContextType>(
	{} as InspectionContextType,
);

export function useInspectionContext(): InspectionContextType {
	return useContext(InspectionContext);
}
