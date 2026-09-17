import { LucideIcon } from "lucide-react";
import { forwardRef } from "react";
import { IconType } from "react-icons";
import { FaCircleExclamation } from "react-icons/fa6";

import { Alert } from "../alert";

type DestructiveAlertProps = Omit<
	React.ComponentPropsWithoutRef<typeof Alert>,
	"variant"
> & {
	icon?: IconType | LucideIcon;
};

const DestructiveAlert = forwardRef<
	React.ComponentRef<typeof Alert>,
	DestructiveAlertProps
>(({ children, icon, ...props }, ref) => {
	const Icon = icon || FaCircleExclamation;

	return (
		<Alert ref={ref} {...props} variant="destructive">
			<Icon />
			{children}
		</Alert>
	);
});
DestructiveAlert.displayName = "DestructiveAlert";

export { DestructiveAlert };
