"use client";

import { createContext } from "react";

import { AuthenticationStatus } from "../enums/AuthenticationStatus";
import { Identity } from "../models/Identity";

type AuthContextType = {
	identity: Identity | null;
	status: AuthenticationStatus;
	isAuthorized: (
		data?: Partial<{
			groups: string[];
			userIds: string[];
			userPhoneNos: string[];
		}>,
	) => boolean;
};

const AuthContext = createContext<AuthContextType>({} as any);

export { type AuthContextType, AuthContext };
