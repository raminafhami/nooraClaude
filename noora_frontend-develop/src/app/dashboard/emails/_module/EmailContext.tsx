"use client";

import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import {
	EmailContextType,
	EmailFoldersType,
} from "@/emails/models/EmailContext";
import { getEmailFolders } from "@/emails/services/getEmailFolders";
import getActiveUser from "@/identity/users/services/getActiveUser";

const EmailContext = createContext<EmailContextType | null>(null);

function EmailsProvider({ children }: PropsWithChildren) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [emailsFolders, setEmailsFolders] = useState<EmailFoldersType[]>([]);
	const [hasConfig, setHasConfig] = useState<boolean>(false);

	const getUserConfig = useCallback(async () => {
		let result = false;
		try {
			setIsLoading(true);
			const user = await getActiveUser();

			const isConfigured = Boolean(user.emailConfig);

			if (!isConfigured) {
				setHasConfig(false);
				// toast.error("ایمیل و رمز عبور اشتباه است");
				return false;
			}

			const { folders } = await getEmailFolders();
			setHasConfig(isConfigured);
			setEmailsFolders(folders ?? []);

			result = true;
		} catch (err: any) {
			console.error(err);

			let errorMessage = "خطای نامشخصی در هنگام دریافت ایمیل ها رخ داد.";

			if (err?.message === "email or password is incorrect.") {
				errorMessage = "ایمیل و رمز عبور اشتباه است";
			}

			toast.error(errorMessage);

			setEmailsFolders([]);
			setHasConfig(false);
		} finally {
			setIsLoading(false);
		}

		return result;
	}, []);

	useEffect(() => {
		getUserConfig();
	}, [getUserConfig]);

	const ctxValue = useMemo(
		() => ({
			emailsFolders,
			userConfiged: hasConfig,
			setUserConfiged: setHasConfig,
			getUserConfig,
		}),
		[emailsFolders, hasConfig, setHasConfig, getUserConfig],
	);

	if (isLoading) {
		return <Spinner />;
	}

	return (
		<EmailContext.Provider value={ctxValue}>{children}</EmailContext.Provider>
	);
}

function useEmailsContext(): EmailContextType {
	const context = useContext(EmailContext);
	if (!context) {
		throw new Error("useEmailsContext must be used within an EmailsProvider");
	}
	return context;
}

export { EmailContext, EmailsProvider, useEmailsContext };
