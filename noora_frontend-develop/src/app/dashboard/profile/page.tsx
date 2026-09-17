import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { ProfilePage as ProfileClientPage } from "./_components/ProfilePage";

const metadata: Metadata = {
	title: "Profile",
};

function ProfilePage() {
	return (
		<Layout.Root>
			<Layout.Head title="پروفایل" />
			<Layout.Content>
				<ProfileClientPage />
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default ProfilePage;
