import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"rounded-2xl border border-border bg-card text-card-foreground shadow-md",
			className,
		)}
		{...props}
	/>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		orientation?: "horizontal" | "vertical";
	}
>(({ className, orientation = "vertical", ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col gap-3 p-6",
			orientation === "horizontal" && "xs:flex-row sm:gap-3",
			className,
		)}
		{...props}
	/>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			"flex min-h-9 items-center gap-3 whitespace-nowrap text-base tracking-tight",
			className,
		)}
		{...props}
	/>
));
CardTitle.displayName = "CardTitle";

const CardIcon = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex size-9 items-center justify-center rounded-xl bg-gray-100 text-base shadow-md",
			className,
		)}
		{...props}
	/>
));
CardIcon.displayName = "CardIcon";

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
CardDescription.displayName = "CardDescription";

const CardNav = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"flex flex-col gap-3 xs:ms-auto xs:flex-row xs:items-center",
			className,
		)}
		{...props}
	/>
));
CardNav.displayName = "CardNav";

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("flex items-center p-6 pt-0", className)}
		{...props}
	/>
));
CardFooter.displayName = "CardFooter";

export {
	Card,
	CardHeader,
	CardTitle,
	CardIcon,
	CardDescription,
	CardNav,
	CardContent,
	CardFooter,
};
