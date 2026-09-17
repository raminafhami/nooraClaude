"use client";

import { redirect } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

import { AuthenticationStatus } from "@/auth/enums/AuthenticationStatus";
import { useAuth } from "@/auth/hooks/useAuth";
import { SocketProvider } from "@/socket/SocketProvider";
import { Loading } from "@/ui/Loader";

import { DashboardProvider } from "./_module/DashboardProvider";

function DashboardLayout({ children }: PropsWithChildren) {
	const { identity, status } = useAuth();

	useEffect(() => {
		if (status === AuthenticationStatus.Unauthenticated) {
			const callbackUrl = window.location.href.replace(
				window.location.origin,
				"",
			);

			redirect(`/login?callbackUrl=${callbackUrl}`);
		}
	}, [status]);

	return (
		<div className="flex h-full">
			<div className="relative flex h-full w-full flex-col">
				{status === AuthenticationStatus.Unauthenticated || !identity ? (
					<div className="h-full w-full">
						<Loading
							className="h-full"
							horizontalPlacement="center"
							verticalPlacement="center"
							size="lg"
						/>
					</div>
				) : (
					<SocketProvider>
						<DashboardProvider>{children}</DashboardProvider>
					</SocketProvider>
				)}
			</div>
		</div>
	);
}

export default DashboardLayout;
