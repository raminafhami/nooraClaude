import { LetterList } from "@/secretariat/components/letter-list/LetterList";
import { Layout } from "@/ui/Layout";

function SecretariatPage() {
	return (
		<Layout.Root>
			<Layout.Head title="دبیرخانه" />
			<Layout.Content>
				<LetterList />
			</Layout.Content>
		</Layout.Root>
	);
}

export default SecretariatPage;
