"use client";

import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

import { Fade } from "../Animation";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	error: any;
}

export function FieldError({ className, error, ...props }: Props) {
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		setMessage((prev) => error?.message?.toString() || prev);
	}, [error]);

	return (
		<Fade
			className={twMerge("mt-2 text-xs text-red-700", className)}
			show={error !== undefined && !!error.message}
		>
			<div className="min-h-[1rem] w-full" {...props}>
				{message}
			</div>
		</Fade>
	);
}
