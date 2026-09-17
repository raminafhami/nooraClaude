"use client";

import { useContext, useMemo } from "react";

import { DialogsContext } from "./dialogs-context";

type OpenDialogOptions<R> = {
	onClose?: (result: R) => Promise<void>;
};

type DialogProps<P = undefined, R = void> = {
	payload: P;
	open: boolean;
	onClose: (result?: R) => Promise<void>;
};

type DialogComponent<P, R> = React.ComponentType<DialogProps<P, R>>;

type OpenDialog = {
	<P extends undefined, R>(
		Component: DialogComponent<P, R>,
		payload?: P,
		options?: OpenDialogOptions<R>,
	): Promise<R>;

	<P, R>(
		Component: DialogComponent<P, R>,
		payload: P,
		options?: OpenDialogOptions<R>,
	): Promise<R>;
};

type CloseDialog = {
	<R>(dialog: Promise<R>, result: R): Promise<R>;
};

type DialogHook = {
	open: OpenDialog;
	close: CloseDialog;
};

function useDialogs(): DialogHook {
	const context = useContext(DialogsContext);

	if (!context) {
		throw new Error("useDialogs must be used within a DialogsProvider.");
	}

	const { open, close } = context;

	return useMemo(
		() => ({
			open,
			close,
		}),
		[close, open],
	);
}

export type {
	CloseDialog,
	DialogComponent,
	DialogProps,
	OpenDialog,
	OpenDialogOptions,
};
export { useDialogs };
