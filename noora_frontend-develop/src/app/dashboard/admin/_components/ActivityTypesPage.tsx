"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	ActivityTypeRecord,
	deleteActivityType,
	getActivityTypes,
	saveActivityType,
} from "@/features/performance-report/api";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroups } from "@/identity/groups/services/getGroups";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

function ActivityTypesPage() {
	const [groups, setGroups] = useState<UserGroup[]>([]);
	const [types, setTypes] = useState<ActivityTypeRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [groupId, setGroupId] = useState("");
	const [description, setDescription] = useState("");
	const [isActive, setIsActive] = useState(true);

	async function reload() {
		setTypes(await getActivityTypes());
	}

	useEffect(() => {
		(async () => {
			try {
				const groupList = await getGroups(null);
				setGroups(Array.isArray(groupList) ? groupList : []);
				await reload();
			} catch (error: any) {
				toast.error(error?.message || "انواع فعالیت دریافت نشد");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	function reset() {
		setEditing(null);
		setTitle("");
		setGroupId("");
		setDescription("");
		setIsActive(true);
	}

	async function submit() {
		if (!title.trim() || !groupId) {
			toast.error("عنوان و گروه را وارد کنید");
			return;
		}
		try {
			await saveActivityType(
				{ title: title.trim(), groupId, description, isActive },
				editing || undefined,
			);
			await reload();
			reset();
			toast.success("نوع فعالیت ذخیره شد");
		} catch (error: any) {
			toast.error(error?.message || "ذخیره ناموفق بود");
		}
	}

	if (loading) return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				انواع فعالیت در ابتدا خالی هستند و به همان گروه‌های موجود سیستم وصل می‌شوند.
			</p>
			<div className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-2">
				<div>
					<Label>عنوان</Label>
					<Input value={title} onChange={(event) => setTitle(event.target.value)} />
				</div>
				<div>
					<Label>گروه</Label>
					<select
						className="h-10 w-full rounded-xl border px-3"
						value={groupId}
						onChange={(event) => setGroupId(event.target.value)}
					>
						<option value="">انتخاب گروه</option>
						{groups.map((group) => (
							<option key={group.id} value={group.id}>
								{group.title} ({group.name})
							</option>
						))}
					</select>
				</div>
				<div className="md:col-span-2">
					<Label>توضیح</Label>
					<Textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
					/>
				</div>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={isActive}
						onChange={(event) => setIsActive(event.target.checked)}
					/>
					فعال
				</label>
				<div>
					<Button type="button" onClick={submit}>
						{editing ? "ویرایش" : "افزودن"}
					</Button>
				</div>
			</div>
			<Panel.Root>
				<Table.Root>
					<Table.Head>
						<Table.Row className="bg-gray-100 text-right">
							<Table.Cell as="th">عنوان</Table.Cell>
							<Table.Cell as="th">گروه</Table.Cell>
							<Table.Cell as="th">وضعیت</Table.Cell>
							<Table.Cell as="th"></Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{types.length === 0 ? (
							<Table.Row>
								<Table.Cell colSpan={4}>نوع فعالیتی تعریف نشده است.</Table.Cell>
							</Table.Row>
						) : (
							types.map((type) => (
								<Table.Row key={type.id}>
									<Table.Cell>{type.title}</Table.Cell>
									<Table.Cell>{type.groupTitle}</Table.Cell>
									<Table.Cell>{type.isActive ? "فعال" : "غیرفعال"}</Table.Cell>
									<Table.Cell>
										<button
											className="me-3 text-primary"
											type="button"
											onClick={() => {
												setEditing(type.id);
												setTitle(type.title);
												setGroupId(type.groupId);
												setDescription(type.description || "");
												setIsActive(type.isActive);
											}}
										>
											ویرایش
										</button>
										<button
											className="text-destructive"
											type="button"
											onClick={async () => {
												try {
													await deleteActivityType(type.id);
													await reload();
												} catch (error: any) {
													toast.error(error?.message || "حذف ناموفق بود");
												}
											}}
										>
											حذف
										</button>
									</Table.Cell>
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table.Root>
			</Panel.Root>
		</div>
	);
}

export { ActivityTypesPage };
