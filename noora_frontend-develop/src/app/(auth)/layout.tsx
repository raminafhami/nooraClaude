import type { PropsWithChildren } from "react";
import Image from "next/image";

import authBackground from "@/assets/images/auth-bg.svg";
import { CUSTOMER_LOGO } from "@/branding";

// Login-page-only logo: distinct from CUSTOMER_LOGO (used in the header
// elsewhere) so it can be swapped independently. Source image is landscape
// (3508x2481), unlike CUSTOMER_LOGO which is square - width/height below
// match that aspect ratio so `h-auto` scales it without distortion.
const LOGIN_LOGO = {
	src: "/images/login-logo.png",
	alt: CUSTOMER_LOGO.alt,
	width: 3508,
	height: 2481,
} as const;

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
				<div className="pointer-events-none flex px-6 py-10 md:px-10 md:py-12">
					<Image
						className="h-auto w-[360px] max-w-full md:w-[450px]"
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
