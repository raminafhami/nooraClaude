import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum KpiTargetMetric {
	FileCount = "fileCount",
	SoldAmount = "soldAmount",
}

const kpiTargetMetrics: Record<KpiTargetMetric, { title: string }> = {
	[KpiTargetMetric.FileCount]: { title: "تعداد فایل" },
	[KpiTargetMetric.SoldAmount]: { title: "مجموع مبلغ" },
};

const kpiTargetMetricOptions = getObjectEntries(kpiTargetMetrics).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export { KpiTargetMetric, kpiTargetMetrics, kpiTargetMetricOptions };
