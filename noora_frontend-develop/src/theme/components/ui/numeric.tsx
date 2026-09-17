import { cn } from "@/lib/utils";

type NumericProps = React.ComponentProps<"span"> & {
	value: string | number | null | undefined;
	placeholder?: string;
};

function Numeric({
	className,
	dir = "ltr",
	placeholder,
	value,
	...props
}: NumericProps) {
	if (!value) return placeholder ?? null;

	return (
		<span
			className={cn("tracking-wider rtl:text-right", className)}
			dir={dir}
			{...props}
		>
			{value}
		</span>
	);
}

export { Numeric };
