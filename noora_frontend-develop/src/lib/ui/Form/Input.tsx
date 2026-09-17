import { cva, VariantProps } from "class-variance-authority";
import { forwardRef, Ref } from "react";
import { twMerge } from "tailwind-merge";

const input = cva(
	"w-full border border-gray-200 transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:bg-gray-50",
	{
		variants: {
			template: {
				sm: "h-8 rounded-lg px-2 text-xs",
				base: "h-10 rounded-xl px-3 text-xsm",
				lg: "h-12 rounded-2xl px-4 text-sm",
			},
		},
		defaultVariants: {
			template: "base",
		},
	},
);

interface Props
	extends React.InputHTMLAttributes<HTMLInputElement>,
		VariantProps<typeof input> {}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
	{ className, id, template, ...props }: Props,
	ref: Ref<HTMLInputElement>,
) {
	return (
		<input
			className={twMerge(input({ template }), className)}
			id={id ?? props.name}
			ref={ref}
			{...props}
		/>
	);
});
