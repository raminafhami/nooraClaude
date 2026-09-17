import { cva, VariantProps } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
	"relative rounded-2xl px-4 py-2.5 [&>svg]:absolute [&>svg]:start-4 [&>svg]:top-3 [&>svg]:size-4 [&>svg~*]:ps-6",
	{
		variants: {
			variant: {
				default: "bg-gray-50 text-gray-900",
				info: "bg-blue-50 text-blue-900",
				success: "bg-green-50 text-green-900",
				warn: "bg-yellow-100 text-yellow-900",
				destructive: "bg-red-50 text-red-900",
			},
		},

		defaultVariants: {
			variant: "default",
		},
	},
);

type AlertProps = React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof alertVariants>;

const Alert = forwardRef<HTMLDivElement, AlertProps>(
	({ className, variant, ...props }, ref) => (
		<div
			ref={ref}
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	),
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn("font-medium tracking-tight", className)}
		{...props}
	/>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("[&_p]:leading-relaxed", className)}
		{...props}
	/>
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
