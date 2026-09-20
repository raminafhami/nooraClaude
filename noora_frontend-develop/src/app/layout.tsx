import "./globals.css";

import { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { PropsWithChildren } from "react";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

import RootLayoutBody from "./_module/RootLayoutBody";
import Providers from "./providers";

const vazirmatnFont = Vazirmatn({
	subsets: ["arabic", "latin"],
	weight: ["400", "500", "600", "700"],
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
