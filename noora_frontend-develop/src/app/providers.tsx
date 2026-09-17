"use client";

import { Direction } from "radix-ui";
import { PropsWithChildren } from "react";

import { AuthProvider } from "@/auth/components/AuthProvider";
import { DialogsProvider } from "@/components/ui/dialog/dialogs-context";

export default function Providers({ children }: PropsWithChildren) {
	return (
		<Direction.Provider dir="rtl">
			<AuthProvider>
				<DialogsProvider>{children}</DialogsProvider>
			</AuthProvider>
		</Direction.Provider>
	);
}
