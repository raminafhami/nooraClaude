type UserFile<T extends string = string> = {
	id: string;
	userId: string;
	title: string;
	key: T;
	status: "confirm" | "reject" | "pending";
	directory: string;
	filename: string;
	createAt: string;
	createBy: string;
	modifyAt: string | null;
	modifyBy: string | null;
};

export type { UserFile };
