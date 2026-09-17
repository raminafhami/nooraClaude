import { cva, VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const card = cva("rounded-2xl", {
	variants: {
		height: {
			xs: "h-16",
			sm: "h-24",
			md: "h-40",
			lg: "h-56",
			xl: "h-72",
			"2xl": "h-96",
			auto: "h-auto",
			full: "h-full",
		},
		intent: {
			default: "bg-gray-100 text-zinc-900",
			primary: "bg-gradient-blue text-white",
			white: "bg-white text-inherit",
		},
		padding: {
			"2xs": "p-0.5",
			xs: "p-1",
			sm: "p-2",
			md: "p-3",
			lg: "p-4",
			xl: "p-5",
			"2xl": "p-6",
		},
	},
	defaultVariants: {
		intent: "default",
		padding: "md",
	},
});

interface Props
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof card> {}

export function Card({
	className,
	children,
	height,
	intent,
	padding,
	...props
}: Props) {
	return (
		<div
			className={twMerge(card({ height, intent, padding }), className)}
			{...props}
		>
			{children}
		</div>
	);
}
