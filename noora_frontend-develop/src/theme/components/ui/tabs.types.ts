import { ReactNode } from "react";
import { IconType } from "react-icons";

import { Identity } from "@/auth/models/Identity";

type TabItemType<TContext = any> = {
	value: string;
	title: string;
	icon?: IconType;
	component: ReactNode;
	authorize?: (identity: Identity | undefined, context?: TContext) => boolean;
};

export type { TabItemType };
