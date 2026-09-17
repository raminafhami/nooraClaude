enum KpiTargetType {
	User = "user",
	Group = "group",
}

const titles = {
	[KpiTargetType.User]: "فردی",
	[KpiTargetType.Group]: "گروهی",
} as const;

const kpiTargetTypesOptions = Object.entries(titles).map(([value, label]) => ({
	value: value as KpiTargetType,
	label,
}));
export { kpiTargetTypesOptions };
