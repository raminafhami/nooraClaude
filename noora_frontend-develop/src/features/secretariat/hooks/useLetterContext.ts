"use client";

import { useContext } from "react";

import { LetterContext, LetterContextType } from "../contexts/LetterContext";

function useLetterContext(): LetterContextType {
	const context = useContext(LetterContext);

	if (!context) {
		throw new Error("useLetterContext must be used within a LetterProvider.");
	}

	return context;
}

export { useLetterContext };
