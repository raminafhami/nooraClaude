import { routes } from "@/routes";

function getInspectionPublicUrl(instanceEncryptedId: string): string {
	return `${routes.app}/inspection/${instanceEncryptedId}`;
}

export { getInspectionPublicUrl };
