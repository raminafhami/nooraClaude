"use client";

import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/80 py-20 !duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
			className,
		)}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ children, className, onInteractOutside, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay>
			<DialogPrimitive.Content
				ref={ref}
				className={cn(
					"relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg !duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-[10%] data-[state=open]:slide-in-from-top-[10%] sm:rounded-2xl",
					className,
				)}
				onInteractOutside={(event) => {
					const target = event.target as HTMLElement;
					const viewport = target.ownerDocument.documentElement;

					// Ignore if the target doesn't exist in the DOM anymore
					if (!viewport.contains(target)) return;

					const originalEvent = event.detail.originalEvent as PointerEvent;
					const scrollbarWidth = 20;
					if (
						originalEvent.clientX > viewport.clientWidth - scrollbarWidth ||
						originalEvent.clientX < scrollbarWidth ||
						originalEvent.clientY > viewport.clientHeight - scrollbarWidth ||
						originalEvent.clientY < scrollbarWidth
					) {
						event.preventDefault();
					} else {
						onInteractOutside?.(event);
					}
				}}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute left-6 top-[1.375rem] rounded-md opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<X className="size-5" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogOverlay>
	</DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col gap-3 pb-4 text-center sm:text-start",
			className,
		)}
		{...props}
	/>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col gap-3 xs:flex-row-reverse", className)}
		{...props}
	/>
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn("text-base leading-none", className)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
