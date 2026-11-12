import type { PropsWithChildren } from "react";
import Image from "next/image";

import { CUSTOMER_LOGO } from "@/branding";

// Login design (dark navy): the customer logo with the form on one half,
// «قدرت گرفته از Reval» on the other. The images were cut out of the design.
const LOGIN_LOGO = {
	src: "/images/branding/atieh-logo-white.png",
	alt: CUSTOMER_LOGO.alt,
	width: 1000,
	height: 406,
} as const;

function AuthLayout({ children }: PropsWithChildren) {
	return (
		<div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#15233a] text-white lg:flex-row">
			<Image
				className="pointer-events-none object-cover"
				src="/images/branding/login-bg.jpg"
				alt=""
				fill
				sizes="100vw"
				priority
			/>

			{/* powered by Reval (right half; below the form on small screens) */}
			<div className="relative order-2 flex w-full items-center justify-center px-6 pb-14 pt-4 lg:order-1 lg:w-1/2 lg:py-0">
				<div className="flex flex-col items-center gap-4 text-center lg:gap-5">
					<p className="text-sm text-white/90 lg:text-base xl:text-lg">قدرت گرفته از</p>
					<Image
						className="h-auto w-[170px] md:w-[210px] xl:w-[250px]"
						src="/images/branding/reval-logo-white.png"
						alt="Reval"
						width={760}
						height={181}
						priority
					/>
					<p className="text-base lg:text-lg xl:text-xl">سامانه یکپارچه راهبری سازمان</p>
				</div>
			</div>

			{/* customer logo + login form (left half) */}
			<div className="relative order-1 flex w-full flex-col items-center justify-center px-6 pb-10 pt-14 lg:order-2 lg:w-1/2 lg:py-16">
				<Image
					className="pointer-events-none h-auto w-[230px] md:w-[290px] xl:w-[340px]"
					src={LOGIN_LOGO.src}
					alt={LOGIN_LOGO.alt}
					width={LOGIN_LOGO.width}
					height={LOGIN_LOGO.height}
					priority
				/>

				<div className="mt-14 flex items-center justify-center lg:mt-24">
					{children}
				</div>
			</div>
		</div>
	);
}

export default AuthLayout;
