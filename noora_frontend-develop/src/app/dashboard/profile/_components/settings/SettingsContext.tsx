import { createContext, useState } from "react";

type SettingsContextType = {
	calendar: "true" | "false" | undefined;
	notepad: "true" | "false" | undefined;
	setSettings: (newValues: Partial<SettingsContextType>) => void;
};

const SettingsContext = createContext<SettingsContextType>({
	calendar: undefined,
	notepad: undefined,
	setSettings: () => {},
});

const SettingsProvider: React.FC = ({ children }: any) => {
	const [settings, setSettings] = useState<SettingsContextType>({
		calendar: undefined,
		notepad: undefined,
		setSettings: (newValues) => {
			setSettings((prevSettings) => ({ ...prevSettings, ...newValues }));
		},
	});

	return (
		<SettingsContext.Provider value={settings}>
			{children}
		</SettingsContext.Provider>
	);
};

export { SettingsContext, SettingsProvider };
