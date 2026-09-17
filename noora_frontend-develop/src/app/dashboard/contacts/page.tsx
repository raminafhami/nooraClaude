import { Metadata } from "next";

import { ContactsClient } from "./_module/ContactsClient";
import { ContactsProvider } from "./_module/ContactsContext";

const metadata: Metadata = {
	title: "Contacts",
};

function ContactPage() {
	return (
		<ContactsProvider>
			<ContactsClient />
		</ContactsProvider>
	);
}

export { metadata };
export default ContactPage;
