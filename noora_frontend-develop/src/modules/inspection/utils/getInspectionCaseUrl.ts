import { Instance } from "@/felo/instances/models/Instance";

function getInspectionCaseUrl(instance: Pick<Instance, "id" | "processKey">) {
	const { id, processKey } = instance;

	const baseUrl = `/dashboard/inspection/${id}`;

	const caseName = processKey.replace("Inspection_Case_", "");
	const postfixUrl = (() => {
		switch (caseName) {
			case "IC":
				return "ic";
			case "COI":
				return "coi";
			case "LC":
				return "lc";
			case "SC":
				return "sc";
			case "Bank_COI":
				return "bank-coi";
			case "Source":
				return "source";
			case "ProductiveSampling":
				return "sampling/productive";
			case "CustomsSampling":
				return "sampling/customs";
			case "ImamSampling":
				return "sampling/customs";
			case "BoushehrSampling":
				return "sampling/boushehr";
			case "BandarAbbasSampling":
				return "sampling/customs";
			default:
				return "";
		}
	})();

	const url = postfixUrl ? `${baseUrl}/${postfixUrl}` : `${baseUrl}`;

	return url;
}

export { getInspectionCaseUrl };
