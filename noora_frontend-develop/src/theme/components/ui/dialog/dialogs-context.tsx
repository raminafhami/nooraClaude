"use client";

import {
	createContext,
	useCallback,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	CloseDialog,
	DialogComponent,
	OpenDialog,
	OpenDialogOptions,
} from "./use-dialogs";

type DialogsContextType = {
	open: OpenDialog;
	close: CloseDialog;
};

const DialogsContext = createContext<DialogsContextType | null>(null);

type DialogStackEntry<P, R> = {
	key: string;
	open: boolean;
	promise: Promise<R>;
	Component: DialogComponent<P, R>;
	payload: P;
	onClose: (result: R) => Promise<void>;
	resolve: (result: R) => void;
};

type DialogProviderProps = {
	children?: React.ReactNode;
	unmountAfter?: number;
};

function DialogsProvider(props: DialogProviderProps) {
	const { children, unmountAfter = 1000 } = props;
	const [stack, setStack] = useState<DialogStackEntry<any, any>[]>([]);
	const keyPrefix = useId();
	const nextId = useRef<number>(0);

	const requestDialog = useCallback<OpenDialog>(
		function open<P, R>(
			Component: DialogComponent<P, R>,
			payload: P,
			options: OpenDialogOptions<R> = {},
		) {
			const { onClose = async () => {} } = options;
			let resolve: ((result: R) => void) | undefined;
			const promise = new Promise<R>((resolveImpl) => {
				resolve = resolveImpl;
			});

			if (typeof resolve === "undefined") {
				throw new Error("resolve is not set.");
			}

			const key = `${keyPrefix}-${nextId.current}`;
			nextId.current += 1;

			const newEntry: DialogStackEntry<P, R> = {
				key,
				open: true,
				promise,
				Component,
				payload,
				onClose,
				resolve,
			};

			setStack((prevStack) => [...prevStack, newEntry]);

			return promise;
		},
		[keyPrefix],
	);

	const closeDialogUi = useCallback(
		function <R>(dialog: Promise<R>) {
			setStack((prevStack) =>
				prevStack.map((entry) =>
					entry.promise === dialog ? { ...entry, open: false } : entry,
				),
			);
			setTimeout(() => {
				// wait for closing animation
				setStack((prevStack) =>
					prevStack.filter((entry) => entry.promise !== dialog),
				);
			}, unmountAfter);
		},
		[unmountAfter],
	);

	const closeDialog = useCallback(
		async function closeDialog<R>(dialog: Promise<R>, result: R) {
			const entryToClose = stack.find((entry) => entry.promise === dialog);

			if (typeof entryToClose === "undefined") {
				throw new Error("dialog is not found.");
			}

			await entryToClose.onClose(result);
			entryToClose.resolve(result);
			closeDialogUi(dialog);

			return dialog;
		},
		[stack, closeDialogUi],
	);

	const ctxValue = useMemo(
		() => ({ open: requestDialog, close: closeDialog }),
		[requestDialog, closeDialog],
	);

	return (
		<DialogsContext.Provider value={ctxValue}>
			{children}
			{stack.map(({ key, open, Component, payload, promise }) => (
				<Component
					key={key}
					payload={payload}
					open={open}
					onClose={async (result) => {
						await closeDialog(promise, result);
					}}
				/>
			))}
		</DialogsContext.Provider>
	);
}

export { DialogsContext, DialogsProvider };
