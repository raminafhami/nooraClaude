"use client";

import { createContext } from "react";

import { Instance } from "@/felo/instances/models/Instance";

type LetterContextType = {
	openAttachmentsDialog: (instance: Instance) => void;
};

const LetterContext = createContext<LetterContextType | null>(null);

export type { LetterContextType };
export { LetterContext };
