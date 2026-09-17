import { Instance } from "@/felo/instances/models/Instance";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";

async function downloadInspectionCertificate(
	instance: Instance,
	args: {
		keys: string[];
		template: string;
		withDesign?: boolean;
		withSignature?: boolean;
		qrCode?: string | null;
	},
): Promise<void> {
	const isDraft =
		!instance.parameters?.["CertificateIssueNo"] ||
		!instance.parameters?.["CertificateIssueDate"];

	const withDesign = !isDraft && !!args.withDesign;
	const withSignature = !isDraft && !!args.withSignature;

	const qrCode = !isDraft && args.qrCode ? args.qrCode : undefined;

	const data = {
		caseNo: instance.caseNo,
		withDesign,
		withSignature,
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

	const payload = {
		name: args.template,
		output: outputName,
		data,
	};

	await downloadTemplate(payload);
}

export { downloadInspectionCertificate };
