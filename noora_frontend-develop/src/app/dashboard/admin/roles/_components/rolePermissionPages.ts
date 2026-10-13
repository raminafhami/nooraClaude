// Groups backend permission subjects under the app's real pages, purely for
// display in the role permission picker. This is presentation-only: it does
// not change which subjects exist or how the backend enforces them. Where a
// page has sub-tabs that share the same backend subject (e.g. "اجراییات" and
// "ممیزی داخلی" both operate on audit/asset_requirement), they show up as one
// combined line rather than two separate ones, since access to them cannot
// currently be split at the backend level.
export interface RolePermissionPage {
	label: string;
	subjects: string[];
}

export const ROLE_PERMISSION_PAGES: RolePermissionPage[] = [
	{
		label: "تضمین کیفیت (اجراییات / ممیزی داخلی)",
		subjects: ["audit", "asset_requirement"],
	},
	{
		label: "تسک‌ها",
		subjects: ["task", "project", "project_task", "project_task_label"],
	},
	{
		label: "تیکت‌ها",
		subjects: ["ticket", "ticket_message"],
	},
	{
		label: "مخاطبین (مشتریان و خریداران)",
		subjects: ["user", "user-relations", "industry"],
	},
	{
		label: "مالی",
		subjects: [
			"financial",
			"income",
			"invoices",
			"payments",
			"petty-cash",
			"petty-cost",
			"category-budget",
			"payment_rule",
			"contract_number",
			"sampling-price",
		],
	},
	{
		label: "منابع انسانی",
		subjects: [
			"personnel",
			"personnel_expertise",
			"personnel_request",
			"personnel_attendance",
			"job_description",
			"education",
			"course",
			"working_time_regulation",
		],
	},
	{
		label: "انبار",
		subjects: ["product", "product_category", "property"],
	},
	{
		label: "ادمین",
		subjects: [
			"company-files",
			"branch",
			"user_group",
			"indicator",
			"process_definition",
			"dispatcher-category",
			"permission",
		],
	},
	{
		label: "بازرسی و فرآیندها",
		subjects: [
			"process_instance",
			"process_instance_report",
			"inspection-cost",
			"sub-contractor",
			"contract",
			"product_category",
		],
	},
	{
		label: "اعلان‌ها و ارتباطات",
		subjects: ["notification", "notification_message", "sms", "emails", "comment"],
	},
];
