"use client";

import { ReactNode, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { cn } from "@/lib/utils";

interface RadioProps extends React.HTMLAttributes<HTMLInputElement> {
	checked?: boolean;
	disabled?: boolean;
	label: ReactNode;
	name: string;
	value: string;
	afterChange?: (value: any) => void;
}

export function Radio({
	checked,
	className,
	disabled,
	id,
	label,
	name,
	value,
	afterChange = () => {},
	...props
}: RadioProps) {
	const method = useFormContext();
	const { register, getValues, setValue } = method;
	const { onChange, ...registerMethods } = register(name);

	useEffect(() => {
		if (checked) {
			setValue(name, value);
		}
	}, []);

	const inputClasses = cn(
		"me-2 rounded-lg border border-gray-200 text-sm leading-6 transition-colors placeholder:text-xs placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:checked:bg-blue-500",
	);

	return (
		<div className={twMerge("flex items-center", className)}>
			<input
				disabled={disabled}
				className={inputClasses}
				id={id}
				type="radio"
				value={value}
				onChange={async (e) => {
					await onChange(e);
					afterChange(getValues(name));
				}}
				{...registerMethods}
				{...props}
			/>
			<label className="flex items-center whitespace-nowrap" htmlFor={id}>
				{label}
			</label>
		</div>
	);
}
