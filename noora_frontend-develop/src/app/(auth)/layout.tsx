import type { PropsWithChildren } from "react";
import Image from "next/image";

import authBackground from "@/assets/images/auth-bg.svg";
import { CUSTOMER_LOGO } from "@/branding";

function AuthLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex w-full">
			<div className="fixed end-0 hidden h-screen w-1/2 lg:block">
				<Image
					className="pointer-events-none object-cover"
					src={authBackground}
					sizes="(max-width: 1024px) 100vw, 100vh"
					alt="REVAL"
					fill
					loading="eager"
				/>
			</div>

			<div className="flex h-full min-h-screen w-full flex-col items-center justify-center space-y-10 lg:w-1/2">
				<div className="pointer-events-none flex px-24 py-10 md:px-32 md:py-12">
					<Image
						className="h-auto w-[120px] max-w-full md:w-[150px]"
						src={CUSTOMER_LOGO.src}
						alt={CUSTOMER_LOGO.alt}
						loading="eager"
						width={150}
						height={150}
					/>
				</div>

				<div className="flex items-center justify-center pb-12">{children}</div>
			</div>
		</div>
	);
}

export default AuthLayout;
