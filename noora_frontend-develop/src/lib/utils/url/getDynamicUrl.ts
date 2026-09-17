import { routes } from "@/routes";

function getDynamicUrl(url: string): string {
	let dynamicUrl = new URL(url, routes.app);
	dynamicUrl.searchParams.set("t", Date.now().toString());
	return dynamicUrl.toString();
}

export { getDynamicUrl };
