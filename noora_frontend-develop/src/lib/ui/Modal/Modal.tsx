"use client";

import { cva, VariantProps } from "class-variance-authority";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { FaTimes } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";

import { ModalContext } from "./modalContext";
import { modalReducer } from "./modalReducer";

const modalClasses = cva("", {
	variants: {
		size: {
			xl: "max-w-xl",
			"2xl": "max-w-2xl",
			"3xl": "max-w-3xl",
			"4xl": "max-w-4xl",
			"5xl": "max-w-5xl",
			"6xl": "max-w-6xl",
			"7xl": "max-w-7xl",
		},
	},
	defaultVariants: {
		size: "3xl",
	},
});

type ModalProps = VariantProps<typeof modalClasses>;

export type ModalSize = ModalProps["size"];

interface Props extends ModalProps {
	show: boolean;
	name: string;
	title: string;
	content: ReactNode;
	scrollable?: "content" | "window";
	onClose: (data: any) => void;
}

export function Modal({
	show,
	name,
	size,
	title,
	content,
	scrollable = "window",
	onClose,
}: Props) {
	const [isMounted, setMounted] = useState<boolean>(false);

	const [modal, dispatch] = useReducer(modalReducer, {
		show: false,
	} as any);

	useEffect(() => {
		dispatch({ type: "LOAD", name, size, title, content });
		setMounted(true);
	}, [content, name, size, title]);

	useEffect(() => {
		if (show) {
			dispatch({ type: "OPEN" });
		}
	}, [show]);

	useEffect(() => {
		if (isMounted && !modal.show) {
			onClose(modal.data);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isMounted, modal.show]);

	const handleClose = useCallback(() => {
		dispatch({ type: "CLOSE" });
	}, []);

	return (
		<ModalContext.Provider value={{ modal, dispatch }}>
			<Transition show={modal.show} as={Fragment}>
				<Dialog as="div" className="relative z-50" onClose={handleClose}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-100"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-100"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-100"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-100"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<div className="flex min-h-full w-full items-center justify-center p-4 text-center">
								<Dialog.Panel
									className={cn(
										modalClasses({ size: modal.size }),
										"flex w-full transform flex-col bg-transparent text-right shadow-xl transition-all duration-300",
										scrollable === "content"
											? "max-h-[85vh] overflow-hidden"
											: "my-20",
									)}
								>
									<div
										className="flex shrink-0 basis-16 justify-between rounded-t-2xl bg-primary-800 bg-contain bg-no-repeat px-6 py-5"
										style={{
											backgroundBlendMode: "lighten",
											backgroundImage: "url(/images/modal-bg.png)",
											backgroundPosition: "left 2rem bottom",
										}}
									>
										<Dialog.Title
											as="h3"
											className="text-lg leading-6 text-white"
										>
											{modal.title}
										</Dialog.Title>
										<div
											className={cn(
												"flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-gray-500",
											)}
											onClick={() => handleClose()}
										>
											<FaTimes />
										</div>
									</div>
									<div
										className={cn(
											"grow rounded-b-2xl bg-white px-6 py-6",
											scrollable === "content" && "h-full overflow-auto",
										)}
									>
										{modal.content}
									</div>
								</Dialog.Panel>
							</div>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition>
		</ModalContext.Provider>
	);
}
