import { routes } from "@/routes";

export function getTemplateUrl(
	instanceId: string,
	templateName: string,
	variables: string[],
	download: boolean = false,
): string {
	// not new URL("/files/...", base): a leading slash drops the base path (/backend)
	return `${routes.externalApi}/files/${instanceId}/export/vars/${variables.join(
		",",
	)}?template=${templateName}&download=${download ? "1" : "0"}`;
}
