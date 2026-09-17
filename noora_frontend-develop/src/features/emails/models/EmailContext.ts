import { ReactNode } from "react";

import { EmailFolder } from "../enums/EmailFolder";

export interface EmailFoldersType {
	folder: EmailFolder;
	unread: number;
	total: number;
}
export type EmailFoldersWithIconsType = {
	label: string;
	icon: ReactNode;
	name: string;
	unread: number;
	total: number;
};

export interface EmailContextType {
	getUserConfig: () => Promise<boolean>;
	emailsFolders: EmailFoldersType[];
	userConfiged: boolean;
	setUserConfiged: (value: boolean) => void;
}
