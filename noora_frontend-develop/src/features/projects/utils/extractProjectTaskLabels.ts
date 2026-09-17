import { ProjectTaskLabel } from "../models/ProjectTaskLabel";

function extractProjectTaskLabels({
	labels,
}: {
	labels: ProjectTaskLabel[] | string[];
}): ProjectTaskLabel[] | undefined {
	if (labels.length < 1) return [];

	if (typeof labels[0] !== "object") return;

	return labels as ProjectTaskLabel[];
}

export { extractProjectTaskLabels };
