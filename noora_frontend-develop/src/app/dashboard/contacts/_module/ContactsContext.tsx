"use client";

import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import { getActivityProject } from "@/activities/services/getActivityProject";
import { Spinner } from "@/components/ui/spinner";
import { Project } from "@/projects/models/Project";

type ContactsContextType = {
	project: Project | undefined;
};

const ContactsContext = createContext<ContactsContextType>({
	project: undefined,
});

function ContactsProvider({ children }: PropsWithChildren) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [project, setProject] = useState<Project>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const project = await getActivityProject();
				setProject(project ?? undefined);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	const ctxValue = useMemo(
		() => ({
			project,
		}),
		[project],
	);

	if (isLoading) {
		return <Spinner loading />;
	}

	return (
		<ContactsContext.Provider value={ctxValue}>
			{children}
		</ContactsContext.Provider>
	);
}

function useContactsContext(): ContactsContextType {
	return useContext(ContactsContext);
}

export { ContactsContext, ContactsProvider, useContactsContext };
export type { ContactsContextType };
