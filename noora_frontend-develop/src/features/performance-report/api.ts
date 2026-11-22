import apiClient from "@/api/client";

export type ActivityRow = {
	id: string;
	userId?: string;
	fullName?: string;
	origin: "system" | "manual";
	originLabel: string;
	dateKey: string;
	title: string;
	description: string;
	sourceModule: string;
	sourceModuleLabel: string;
	sourceLink: string | null;
	relatedLabel: string | null;
	startTime: string | null;
	endTime: string | null;
	durationMinutes: number | null;
	durationLabel: string | null;
	colleagues: { userId: string; fullName: string }[];
	status: "completed" | "incomplete";
	statusLabel: string;
	incompleteReason: string | null;
	activityTypeId: string | null;
	activityTypeTitle: string | null;
	organizationalUnitId: string | null;
	organizationalUnitTitle: string;
	changeHistory: {
		at: string;
		byName: string;
		summary?: string;
		changes?: Record<string, { from: unknown; to: unknown }>;
	}[];
};

export type DayReport = {
	userId: string;
	fullName: string;
	dateKey: string;
	dateLabel: string;
	organizationalUnit: { id: string | null; title: string };
	reportStatus: "sent" | "draft";
	reportStatusLabel: string;
	sentAt: string | null;
	sentBy: "manual" | "auto" | null;
	reportChangeHistory: { at: string; byName: string; summary: string }[];
	delayedTasks: number | null;
	note: string;
	summary: {
		total: number;
		system: number;
		manual: number;
		completed: number;
		incomplete: number;
		durationMinutes: number | null;
		durationLabel: string | null;
	};
	rows: ActivityRow[];
};

export type ManualActivityInput = {
	date: string;
	organizationalUnitId?: string;
	activityTypeId: string;
	description: string;
	colleagueIds: string[];
	startTime?: string;
	endTime?: string;
	status: "completed" | "incomplete";
	incompleteReason?: string;
};

async function unwrap<T>(promise: Promise<{ result: T }>) {
	const response = await promise;
	return response.result;
}

export function getMyDay(date: string) {
	return unwrap(
		apiClient.get<DayReport>({
			url: "performance-report/my-day",
			searchParams: { date },
		}),
	);
}

export function sendMyDay() {
	return unwrap(
		apiClient.post<DayReport>({ url: "performance-report/my-day/send" }),
	);
}

export function getMyUnits() {
	return unwrap(
		apiClient.get<{ id: string | null; title: string }[]>({
			url: "performance-report/my-units",
		}),
	);
}

export function getMyActivityTypes() {
	return unwrap(
		apiClient.get<
			{ id: string; title: string; groupId: string; groupTitle: string }[]
		>({ url: "performance-report/activity-types" }),
	);
}

export function getColleagues() {
	return unwrap(
		apiClient.get<{ id: string; fullName: string }[]>({
			url: "performance-report/colleagues",
		}),
	);
}

export function createManualActivity(body: ManualActivityInput) {
	return unwrap(
		apiClient.post<DayReport>({
			url: "performance-report/activities",
			body,
		}),
	);
}

export function updateManualActivity(id: string, body: ManualActivityInput) {
	return unwrap(
		apiClient.put<DayReport>({
			url: `performance-report/activities/${id}`,
			body,
		}),
	);
}

export function deleteManualActivity(id: string) {
	return unwrap(
		apiClient.delete<DayReport>({
			url: `performance-report/activities/${id}`,
		}),
	);
}

export function getPersonnelReports(date: string) {
	return unwrap(
		apiClient.get<{
			dateKey: string;
			dateLabel: string;
			showDelayed: boolean;
			note: string;
			rows: {
				userId: string;
				fullName: string;
				organizationalUnitTitle: string;
				dateLabel: string;
				total: number;
				system: number;
				manual: number;
				completed: number;
				incomplete: number;
				delayedTasks: number | null;
				reportStatusLabel: string;
			}[];
		}>({
			url: "performance-report/personnel",
			searchParams: { date },
		}),
	);
}

export function getPersonnelDay(userId: string, date: string) {
	return unwrap(
		apiClient.get<DayReport>({
			url: `performance-report/personnel/${userId}/day`,
			searchParams: { date },
		}),
	);
}

export function getPerformanceFilters() {
	return unwrap(
		apiClient.get<{
			employees: { id: string; fullName: string }[];
			units: { id: string; title: string }[];
			activityTypes: { id: string; title: string }[];
			origins: { id: string; title: string }[];
			sourceModules: { id: string; title: string }[];
		}>({ url: "performance-report/filters" }),
	);
}

export function getPerformanceCharts(searchParams: Record<string, string>) {
	return unwrap(apiClient.get<PerformanceCharts>({
		url: "performance-report/charts",
		searchParams,
	}));
}

export type PerformanceCharts = {
	fromLabel: string;
	toLabel: string;
	note: string;
	summary: {
		volume: number;
		taskCompletionPercent: number | null;
		onTimePercent: number | null;
		delayed: number | null;
		durationMinutes: number | null;
		collaboration: number | null;
	};
	dailyActivityCount: { date: string; name: string; count: number }[] | null;
	byEmployee: { name: string; count: number }[] | null;
	completedVsIncomplete: { completed: number; incomplete: number } | null;
	delayedByEmployee: { name: string; count: number }[] | null;
	timeSpent: { name: string; minutes: number; label: string }[] | null;
	byActivityType: { name: string; count: number }[] | null;
	bySourceModule: { name: string; count: number }[] | null;
	collaboration: { name: string; count: number }[] | null;
	byUnit: { name: string; count: number }[] | null;
};

export type ActivityTypeRecord = {
	id: string;
	title: string;
	description: string;
	isActive: boolean;
	groupId: string;
	groupTitle: string;
};

export function getActivityTypes() {
	return unwrap(
		apiClient.get<ActivityTypeRecord[]>({
			url: "performance-report/admin/activity-types",
		}),
	);
}

export function saveActivityType(
	body: {
		title: string;
		groupId: string;
		description?: string;
		isActive?: boolean;
	},
	id?: string,
) {
	if (id) {
		return unwrap(
			apiClient.put<ActivityTypeRecord>({
				url: `performance-report/admin/activity-types/${id}`,
				body,
			}),
		);
	}
	return unwrap(
		apiClient.post<ActivityTypeRecord>({
			url: "performance-report/admin/activity-types",
			body,
		}),
	);
}

export function deleteActivityType(id: string) {
	return unwrap(
		apiClient.delete<{ deleted: boolean }>({
			url: `performance-report/admin/activity-types/${id}`,
		}),
	);
}
