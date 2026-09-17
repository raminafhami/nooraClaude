import { routes } from "@/routes";

export function getTemplateUrl(
	instanceId: string,
	templateName: string,
	variables: string[],
	download: boolean = false,
): string {
	return new URL(
		`/files/${instanceId}/export/vars/${variables.join(
			",",
		)}?template=${templateName}&download=${download ? "1" : "0"}`,
		routes.externalApi,
	).toString();
}
