import { routes } from "@/routes";

function getLetterPublicUrl(instanceEncryptedId: string): string {
	return `${routes.app}/letter/${instanceEncryptedId}`;
}

export { getLetterPublicUrl };
