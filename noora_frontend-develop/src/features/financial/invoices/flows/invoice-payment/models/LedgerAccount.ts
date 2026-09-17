// The 'duplicateWithoutSlCode' property only exists for older data that were
// identifiable using the 'dlCode' and did not have an 'slCode' associated with them.
type LedgerAccount = {
	title: string;
	description?: React.ReactNode;
	slCode: string;
	dlCode: string;
	visible?: boolean;
};

export type { LedgerAccount };
