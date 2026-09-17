"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { cn } from "@/lib/utils";

interface CheckboxProps extends React.HTMLAttributes<HTMLInputElement> {
	disabled?: boolean;
	label: string;
	name: string;
	afterChange?: (value: any) => void;
}

export function Checkbox({
	className,
	defaultValue,
	disabled,
	label,
	name,
	afterChange = () => {},
	...props
}: CheckboxProps) {
	const method = useFormContext();
	const { register, getValues, setValue } = method;
	const { onChange, ...registerMethods } = register(name);

	useEffect(() => {
		if (defaultValue) {
			setValue(name, defaultValue);
		}
	}, []);

	const inputClasses = cn(
		"me-2 rounded-lg border border-gray-200 text-sm leading-6 transition-colors placeholder:text-xs placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed",
	);

	return (
		<div className={twMerge("flex items-center", className)}>
			<input
				disabled={disabled}
				className={inputClasses}
				id={name}
				type="checkbox"
				onChange={async (e) => {
					await onChange(e);
					afterChange(getValues(name));
				}}
				{...registerMethods}
				{...props}
			/>
			<label className="cursor-pointer" htmlFor={name}>
				{label}
			</label>
		</div>
	);
}
