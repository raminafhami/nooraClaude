type SelectItemType<T extends string = string> = {
	value: T;
	label: string;
	description?: React.ReactNode;
	visible?: boolean;
};

export type { SelectItemType };
