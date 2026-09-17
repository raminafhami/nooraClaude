import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";

function PageError({ children }: React.PropsWithChildren) {
	return (
		<div className="flex min-h-svh w-full items-center justify-center">
			<DestructiveAlert>
				<AlertDescription>{children}</AlertDescription>
			</DestructiveAlert>
		</div>
	);
}

export { PageError };
