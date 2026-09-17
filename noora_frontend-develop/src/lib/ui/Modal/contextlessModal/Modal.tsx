import { cva } from "class-variance-authority";
import { Fragment } from "react";
import { FaTimes } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { Dialog, Transition } from "@headlessui/react";

interface Props {
	show: boolean;
	name: string;
	content: React.ReactNode;
	title: string;
	size: "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
	onClose: () => void;
	loading?: boolean;
}

const modal = cva("", {
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

export default function MyModal({
	show,
	name,
	title,
	onClose,
	content,
	size,
	loading,
}: Props) {
	return (
		<Transition appear show={show} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={onClose}>
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
									modal({ size: size }),
									"my-20 w-full transform bg-transparent text-right shadow-xl transition-all duration-300",
								)}
							>
								<div
									className="flex h-16 justify-between rounded-t-2xl bg-primary-800 bg-contain bg-no-repeat px-6 py-5"
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
										{title}
									</Dialog.Title>
									<div
										className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-gray-500"
										onClick={() => onClose()}
									>
										<FaTimes />
									</div>
								</div>
								<div className="rounded-b-2xl bg-white px-6 py-6">
									{loading ? <Loading /> : content}
								</div>
							</Dialog.Panel>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	);
}
