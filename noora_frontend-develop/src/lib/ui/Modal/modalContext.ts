"use client";

import React from "react";

import { ModalAction, ModalProps } from "./modalReducer";

import type { Dispatch } from "react";
interface ModalContextType {
	modal: ModalProps;
	dispatch: Dispatch<ModalAction>;
}

export const ModalContext = React.createContext<ModalContextType>(
	{} as ModalContextType,
);
