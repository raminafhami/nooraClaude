import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface RootProps {
	children: ReactNode;
}

export function Root({ children }: RootProps) {
	return children;
}

interface HeadProps {
	children?: ReactNode;
	title: React.ReactNode;
	titleClassName?: string;
}

export function Head({ children, title, titleClassName }: HeadProps) {
	return (
		<div className="flex items-center gap-x-4 py-10">
			<div className={twMerge("text-lg", titleClassName)}>{title}</div>
			{children}
		</div>
	);
}

interface ContentProps {
	children: ReactNode;
	className?: string;
}

export function Content({ children, className }: ContentProps) {
	return (
		<div className={twMerge("flex flex-col gap-y-10 pb-10", className)}>
			{children}
		</div>
	);
}
