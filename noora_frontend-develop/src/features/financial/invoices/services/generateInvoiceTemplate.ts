import apiClient from "@/api/client";
import { ObjectType } from "@/utils/object/ObjectType";

interface GenerateTemplateDto {
	download: "html" | "pdf";
}

async function generateInvoiceTemplate(
	id: string,
	details: Omit<GenerateTemplateDto, "download"> & { download: "html" },
): Promise<string>;

async function generateInvoiceTemplate(
	id: string,
	details: Omit<GenerateTemplateDto, "download"> & { download: "pdf" },
): Promise<Blob>;

async function generateInvoiceTemplate(
	id: string,
	details: GenerateTemplateDto,
): Promise<string | Blob> {
	const searchParams: ObjectType = {
		download: details.download,
	};

	if (details.download === "pdf") {
		return await apiClient.send({
			url: `/invoice/${id}`,
			searchParams,
			responseType: "blob",
		});
	}

	return await apiClient.send({
		url: `/invoice/${id}`,
		searchParams,
		responseType: "text",
	});
}

export { generateInvoiceTemplate };
