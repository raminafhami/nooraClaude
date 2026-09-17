"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { Modal } from "../Modal";
import { NavItemModalProps } from "./navService";

export function NavItemModal({
	classes,
	label,
	modalKey,
	modalSize,
	modalTitle,
	modalContent,
	icon,
}: NavItemModalProps) {
	const [isOpen, setOpen] = useState(false);

	const buttonClasses = cn(classes, "w-full text-start");

	return (
		<>
			<button className={buttonClasses} onClick={() => setOpen(true)}>
				<span className="flex items-center gap-2">{icon}</span>
			</button>

			<Modal
				show={isOpen}
				name={modalKey}
				size={modalSize}
				title={modalTitle ?? label}
				content={modalContent}
				onClose={() => {
					setOpen(false);
				}}
			/>
		</>
	);
}
