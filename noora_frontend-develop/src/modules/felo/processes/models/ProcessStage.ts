interface ProcessStage {
	id: string;
	key: string;
	name: string;
	dueDate?: string | null;
	subType: string;
	type: string;
}

export type { ProcessStage };
