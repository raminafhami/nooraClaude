export interface Permission {
	id: string;
	actions: string[];
	subject: string;
	description: string;
	conditions?: Record<string, unknown>;
}

export interface PermissionApi {
	id: string;
	actions: string[];
	subject: string;
	description: string;
	conditions?: Record<string, unknown>;
}
