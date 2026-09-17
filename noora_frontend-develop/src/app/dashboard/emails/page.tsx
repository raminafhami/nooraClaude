import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { EmailClient } from "./_components/EmailClient";
import { EmailsProvider } from "./_module/EmailContext";

const metadata: Metadata = {
	title: "Emails",
};

function ContactPage() {
	return (
		<EmailsProvider>
			<Layout.Root>
				<Layout.Head title="ایمیل ها" />
				<Layout.Content>
					<EmailClient />
				</Layout.Content>
			</Layout.Root>
		</EmailsProvider>
	);
}

export { metadata };
export default ContactPage;
