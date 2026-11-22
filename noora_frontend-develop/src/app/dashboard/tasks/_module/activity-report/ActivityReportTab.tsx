"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	ActivityRow,
	DayReport,
	ManualActivityInput,
	createManualActivity,
	deleteManualActivity,
	getColleagues,
	getMyActivityTypes,
	getMyDay,
	getMyUnits,
	sendMyDay,
	updateManualActivity,
} from "@/features/performance-report/api";
import { ActivityRowsTable } from "@/features/performance-report/ActivityRowsTable";
import { Loading } from "@/ui/Loader";

function ActivityReportTab() {
	const [date, setDate] = useState(moment().format("jYYYY/jMM/jDD"));
	const [day, setDay] = useState<DayReport | null>(null);
	const [loading, setLoading] = useState(true);
	const [units, setUnits] = useState<{ id: string | null; title: string }[]>([]);
	const [types, setTypes] = useState<
		{ id: string; title: string; groupTitle: string }[]
	>([]);
	const [colleagues, setColleagues] = useState<{ id: string; fullName: string }[]>(
		[],
	);
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<string | null>(null);
	const [form, setForm] = useState<ManualActivityInput>({
		date: moment().format("jYYYY/jMM/jDD"),
		description: "",
		activityTypeId: "",
		colleagueIds: [],
		status: "completed",
		startTime: "",
		endTime: "",
		incompleteReason: "",
	});

	const load = useCallback(async (value: string) => {
		setLoading(true);
		try {
			setDay(await getMyDay(value));
		} catch (error: any) {
			toast.error(error?.message || "دریافت گزارش ناموفق بود");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load(date);
	}, [date, load]);

	useEffect(() => {
		(async () => {
			try {
				const [unitList, typeList, colleagueList] = await Promise.all([
					getMyUnits(),
					getMyActivityTypes(),
					getColleagues(),
				]);
				setUnits(unitList);
				setTypes(typeList);
				setColleagues(colleagueList);
				setForm((current) => ({
					...current,
					organizationalUnitId: unitList[0]?.id || undefined,
				}));
			} catch (error: any) {
				toast.error(error?.message || "اطلاعات فرم دریافت نشد");
			}
		})();
	}, []);

	function toggleColleague(id: string) {
		setForm((current) => ({
			...current,
			colleagueIds: current.colleagueIds.includes(id)
				? current.colleagueIds.filter((item) => item !== id)
				: [...current.colleagueIds, id],
		}));
	}

	async function submit() {
		if (!form.activityTypeId) {
			toast.error("نوع فعالیت را انتخاب کنید");
			return;
		}
		if (!form.description.trim()) {
			toast.error("شرح را وارد کنید");
			return;
		}
		if (!form.colleagueIds.length) {
			toast.error("حداقل یک همکار را انتخاب کنید");
			return;
		}
		if (form.status === "incomplete" && !form.incompleteReason?.trim()) {
			toast.error("برای فعالیت تکمیل‌نشده ذکر دلیل الزامی است");
			return;
		}
		try {
			const next = editing
				? await updateManualActivity(editing, form)
				: await createManualActivity(form);
			setDay(next);
			setOpen(false);
			setEditing(null);
			toast.success(editing ? "فعالیت ویرایش شد" : "فعالیت ثبت شد");
		} catch (error: any) {
			toast.error(error?.message || "ثبت فعالیت ناموفق بود");
		}
	}

	function startEdit(row: ActivityRow) {
		setEditing(row.id);
		setOpen(true);
		setForm({
			date,
			organizationalUnitId: row.organizationalUnitId || undefined,
			activityTypeId: row.activityTypeId || "",
			description: row.description,
			colleagueIds: row.colleagues.map((item) => item.userId),
			startTime: row.startTime || "",
			endTime: row.endTime || "",
			status: row.status,
			incompleteReason: row.incompleteReason || "",
		});
	}

	async function remove(row: ActivityRow) {
		try {
			setDay(await deleteManualActivity(row.id));
			toast.success("فعالیت حذف شد");
		} catch (error: any) {
			toast.error(error?.message || "حذف ناموفق بود");
		}
	}

	const fullName = day?.fullName || "";

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="space-y-1">
					<Label>تاریخ</Label>
					<DateInput
						value={date}
						onChange={(value) => {
							if (typeof value === "string" && value) setDate(value.split(" ")[0]);
						}}
					/>
				</div>
				<div className="flex gap-2">
					<Button
						type="button"
						variant="secondary"
						onClick={() => {
							setEditing(null);
							setForm((current) => ({
								...current,
								date,
								description: "",
								colleagueIds: [],
								status: "completed",
								incompleteReason: "",
								startTime: "",
								endTime: "",
							}));
							setOpen((value) => !value);
						}}
					>
						افزودن فعالیت
					</Button>
					<Button
						type="button"
						disabled={day?.reportStatus === "sent" || date !== moment().format("jYYYY/jMM/jDD")}
						onClick={async () => {
							try {
								setDay(await sendMyDay());
								toast.success("گزارش امروز ارسال شد");
							} catch (error: any) {
								toast.error(error?.message || "ارسال ناموفق بود");
							}
						}}
					>
						ارسال
					</Button>
				</div>
			</div>

			{day && (
				<p className="text-sm text-muted-foreground">
					{day.note} وضعیت گزارش: {day.reportStatusLabel}
					{day.sentBy === "auto" ? " (خودکار ساعت ۱۸)" : ""}
					{day.sentBy === "manual" ? " (دستی)" : ""}
				</p>
			)}

			{day && (
				<div className="grid grid-cols-2 gap-2 md:grid-cols-6">
					<Summary label="کل" value={day.summary.total} />
					<Summary label="سیستمی" value={day.summary.system} />
					<Summary label="دستی" value={day.summary.manual} />
					<Summary label="تکمیل‌شده" value={day.summary.completed} />
					<Summary label="تکمیل‌نشده" value={day.summary.incomplete} />
					<Summary label="مدت" value={day.summary.durationLabel || "-"} />
				</div>
			)}

			{open && (
				<div className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
					<div>
						<Label>نام و نام خانوادگی</Label>
						<Input value={fullName} readOnly />
					</div>
					<div>
						<Label>واحد سازمانی</Label>
						<select
							className="h-10 w-full rounded-xl border px-3"
							value={form.organizationalUnitId || ""}
							onChange={(event) =>
								setForm({ ...form, organizationalUnitId: event.target.value })
							}
						>
							{units.map((unit) => (
								<option key={unit.id || unit.title} value={unit.id || ""}>
									{unit.title}
								</option>
							))}
						</select>
					</div>
					<div>
						<Label>نوع فعالیت</Label>
						<select
							className="h-10 w-full rounded-xl border px-3"
							value={form.activityTypeId}
							onChange={(event) =>
								setForm({ ...form, activityTypeId: event.target.value })
							}
						>
							<option value="">انتخاب کنید</option>
							{types.map((type) => (
								<option key={type.id} value={type.id}>
									{type.title}
									{type.groupTitle ? ` (${type.groupTitle})` : ""}
								</option>
							))}
						</select>
						{types.length === 0 && (
							<p className="mt-1 text-xs text-muted-foreground">
								برای گروه شما هنوز نوع فعالیتی تعریف نشده است.
							</p>
						)}
					</div>
					<div>
						<Label>وضعیت نهایی</Label>
						<select
							className="h-10 w-full rounded-xl border px-3"
							value={form.status}
							onChange={(event) =>
								setForm({
									...form,
									status: event.target.value as ManualActivityInput["status"],
								})
							}
						>
							<option value="completed">تکمیل‌شده</option>
							<option value="incomplete">تکمیل‌نشده</option>
						</select>
					</div>
					<div>
						<Label>ساعت شروع</Label>
						<Input
							type="time"
							value={form.startTime || ""}
							onChange={(event) => setForm({ ...form, startTime: event.target.value })}
						/>
					</div>
					<div>
						<Label>ساعت پایان</Label>
						<Input
							type="time"
							value={form.endTime || ""}
							onChange={(event) => setForm({ ...form, endTime: event.target.value })}
						/>
					</div>
					<div className="md:col-span-2">
						<Label>شرح</Label>
						<Textarea
							value={form.description}
							onChange={(event) =>
								setForm({ ...form, description: event.target.value })
							}
						/>
					</div>
					{form.status === "incomplete" && (
						<div className="md:col-span-2">
							<Label>دلیل تکمیل‌نشدن</Label>
							<Textarea
								value={form.incompleteReason || ""}
								onChange={(event) =>
									setForm({ ...form, incompleteReason: event.target.value })
								}
							/>
						</div>
					)}
					<div className="md:col-span-2">
						<Label>همکاران</Label>
						<div className="max-h-36 space-y-1 overflow-auto rounded-xl border p-2">
							{colleagues.length === 0 && (
								<p className="text-sm text-muted-foreground">همکاری یافت نشد.</p>
							)}
							{colleagues.map((person) => (
								<label key={person.id} className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={form.colleagueIds.includes(person.id)}
										onChange={() => toggleColleague(person.id)}
									/>
									{person.fullName}
								</label>
							))}
						</div>
					</div>
					<div className="flex gap-2">
						<Button type="button" onClick={submit}>
							ثبت
						</Button>
						{editing && (
							<Button
								type="button"
								variant="destructive"
								onClick={() =>
									remove({ id: editing, origin: "manual" } as ActivityRow)
								}
							>
								حذف
							</Button>
						)}
					</div>
				</div>
			)}

			{day?.reportChangeHistory?.length ? (
				<p className="text-xs text-muted-foreground">
					تغییرات پس از ارسال:{" "}
					{day.reportChangeHistory.map((item) => item.summary).join(" | ")}
				</p>
			) : null}

			{loading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : (
				<ActivityRowsTable rows={day?.rows ?? []} onEdit={startEdit} />
			)}
		</div>
	);
}

function Summary({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="rounded-xl border bg-white px-3 py-2">
			<div className="text-xs text-muted-foreground">{label}</div>
			<div className="text-sm">{value}</div>
		</div>
	);
}

export default ActivityReportTab;
