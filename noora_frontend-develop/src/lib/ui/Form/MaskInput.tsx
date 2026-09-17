"use client";

import { cva, VariantProps } from "class-variance-authority";
import { forwardRef, Ref } from "react";
import { IMaskInput } from "react-imask";
import { twMerge } from "tailwind-merge";

export interface MaskInputProps
	extends React.InputHTMLAttributes<HTMLInputElement>,
		VariantProps<typeof input> {
	mask?: any;
	maskOptions?: any;
	onMutate?: (value: string) => Promise<void> | void;
}

const input = cva(
	"w-full border border-gray-200 transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50",
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

export const MaskInput = forwardRef<HTMLInputElement, MaskInputProps>(
	function MaskInput(
		{
			className,
			mask,
			maskOptions = {},
			template,
			onChange,
			onMutate,
			...props
		}: MaskInputProps,
		ref: Ref<HTMLInputElement>,
	) {
		return (
			<IMaskInput
				className={twMerge(input({ template }), className)}
				mask={mask}
				inputRef={ref}
				unmask={true}
				onAccept={async (unmaskedValue: string, mask) => {
					await onMutate?.(unmaskedValue);
				}}
				{...maskOptions}
				{...props}
			/>
		);
	},
);
