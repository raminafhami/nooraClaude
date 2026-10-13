import type { PropsWithChildren } from "react";
import Image from "next/image";

import { CUSTOMER_LOGO } from "@/branding";

// Login-page-only logo: distinct from CUSTOMER_LOGO (used in the header
// elsewhere) so it can be swapped independently.
const LOGIN_LOGO = {
	src: "/images/branding/apk-logo-full.svg",
	alt: CUSTOMER_LOGO.alt,
	width: 303,
	height: 142,
} as const;

function AuthLayout({ children }: PropsWithChildren) {
	return (
		<div className="flex min-h-screen w-full flex-col lg:flex-row">
			<div className="relative flex w-full shrink-0 items-center justify-center overflow-hidden py-14 lg:w-1/2 lg:py-0">
				<Image
					className="pointer-events-none object-cover"
					src="/images/branding/auth-gradient.svg"
					alt=""
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					loading="eager"
				/>
				<Image
					className="pointer-events-none object-cover"
					src="/images/branding/auth-hexagons.svg"
					alt=""
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					loading="eager"
				/>

				<Image
					className="relative h-auto w-[220px] md:w-[280px]"
					src="/images/branding/powered-by-reval.svg"
					alt="Powered by reval"
					width={344}
					height={212}
					loading="eager"
				/>
			</div>

			<div className="flex w-full flex-col items-center justify-center space-y-10 lg:w-1/2">
				<div className="pointer-events-none flex px-6 py-10 md:px-10 md:py-12">
					<Image
						className="h-auto w-[280px] max-w-full md:w-[340px]"
						src={LOGIN_LOGO.src}
						alt={LOGIN_LOGO.alt}
						loading="eager"
						width={LOGIN_LOGO.width}
						height={LOGIN_LOGO.height}
					/>
				</div>

				<div className="flex items-center justify-center pb-12">{children}</div>
			</div>
		</div>
	);
}

export default AuthLayout;
