import { Instance } from "@/felo/instances/models/Instance";
import generateTemplate from "@/template-engine/services/generateTemplate";

async function generateInspectionCertificate(
	instance: Instance,
	args: {
		keys: string[];
		template: string;
		withDesign?: boolean;
		qrCode?: string | null;
	},
): Promise<string> {
	const isDraft =
		!instance.parameters?.["CertificateIssueNo"] ||
		!instance.parameters?.["CertificateIssueDate"];

	const withDesign = !isDraft && !!args.withDesign;

	const qrCode = !isDraft && args.qrCode ? args.qrCode : undefined;

	const data = {
		caseNo: instance.caseNo,
		withDesign,
		qrCode,
		...args.keys.reduce<Record<string, any>>(
			(obj, curr) => ({ ...obj, [curr]: instance.parameters?.[curr] }),
			{},
		),
	};

	let outputName = `${instance.caseNo} Certificate`;
	if (isDraft) {
		outputName = `${outputName} Draft`;
	}

	const result = await generateTemplate({
		name: args.template,
		output: outputName,
		data,
		download: false,
	});

	return result;
}

export { generateInspectionCertificate };
