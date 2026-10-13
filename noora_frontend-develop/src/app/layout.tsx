import "./globals.css";

import { Metadata } from "next";
import localFont from "next/font/local";
import { PropsWithChildren } from "react";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

import RootLayoutBody from "./_module/RootLayoutBody";
import Providers from "./providers";

// Self-hosted instead of next/font/google: the Google Fonts build-time fetch
// times out from this server's network (same reason the docker-compose
// elasticsearch image was switched to the Docker Hub mirror).
const vazirmatnFont = localFont({
	src: [
		{ path: "../../public/fonts/vazirmatn/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
		{ path: "../../public/fonts/vazirmatn/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
		{ path: "../../public/fonts/vazirmatn/Vazirmatn-SemiBold.woff2", weight: "600", style: "normal" },
		{ path: "../../public/fonts/vazirmatn/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
	],
	variable: "--font-family-vazirmatn",
});

const metadata: Metadata = {
	title: {
		template: "%s | APK",
		default: "APK",
	},
	description: "",
};

function RootLayout({ children }: PropsWithChildren) {
	return (
		<html dir="rtl" lang="fa-IR" className={cn(vazirmatnFont.variable)}>
			<RootLayoutBody>
				<Toaster
					position="bottom-left"
					theme="light"
					loadingIcon={<Loading />}
					dir="rtl"
					visibleToasts={5}
					toastOptions={{
						className: "toast",
					}}
					richColors
					closeButton
				/>
				<Providers>{children}</Providers>
			</RootLayoutBody>
		</html>
	);
}

export { metadata };
export default RootLayout;
