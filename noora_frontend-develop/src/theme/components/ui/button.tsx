import { cva, VariantProps } from "class-variance-authority";
import { ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

const buttonVariants = cva(
	[
		"btn inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-xsm shadow-[2px_2px_2px_#c7c7c7,0px_0px_1px_#c7c7c7] transition",
		"hover:shadow-[2px_2px_2px_#b9b9b9,0px_0px_1px_#c7c7c7]",
		"active:shadow-[inset_5px_5px_5px_rgba(0,0,0,0.25),inset_-1px_-1px_5px_rgba(0,0,0,0.05)]",
		"disabled:pointer-events-none disabled:opacity-50",
		"focus-visible:outline-none",
	],
	{
		variants: {
			variant: {
				default: [
					"text-white-foreground bg-white",
					"hover:bg-white/80",
					"active:bg-white/80",
				],
				primary: [
					"bg-primary/90 text-primary-foreground",
					"hover:bg-primary focus:bg-primary",
					"active:bg-primary",
				],
				destructive: [
					"bg-destructive/90 text-destructive-foreground",
					"hover:bg-destructive focus:bg-destructive",
					"active:bg-destructive",
				],
				secondary: [
					"bg-secondary text-secondary-foreground",
					"hover:bg-secondary/80 focus:bg-secondary/80",
					"active:bg-secondary/80",
				],
				link: [
					"underline-offset-4 shadow-none",
					"hover:underline hover:shadow-none focus:underline focus:shadow-none",
					"active:shadow-none",
				],
				ghost: [
					"shadow-none",
					"hover:bg-accent hover:text-accent-foreground hover:shadow-none focus:bg-accent focus:text-accent-foreground focus:shadow-none",
					"active:bg-accent active:text-accent-foreground active:shadow-none",
				],
				outline: [
					"border border-input bg-background shadow-none",
					"hover:bg-accent hover:text-accent-foreground hover:shadow-none focus:bg-accent focus:text-accent-foreground focus:shadow-none",
					"active:bg-accent active:text-accent-foreground active:shadow-none",
				],
			},
			size: {
				xs: "rounded-lg px-2 py-1 text-xs",
				sm: "px-3 py-2 text-xs",
				md: "px-4 py-2",
				lg: "px-6 py-2.5",
				xl: "px-8 py-3",
				icon: "size-4",
			},
		},
		compoundVariants: [
			{
				variant: "outline",
				size: "md",
				className: "py-[7px]",
			},
			{
				variant: "outline",
				size: "lg",
				className: "py-[9px]",
			},
		],
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

interface ButtonProps
	extends Omit<ComponentProps<"button">, "color">,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";

		return (
			<Comp
				ref={ref}
				className={cn(
					buttonVariants({ size, variant, className }),
					variant === "link" && "p-0",
				)}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
