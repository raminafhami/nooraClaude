"use client";

import { omit } from "lodash";
import { useState } from "react";
import { toast } from "sonner";

import PutOwnSettings from "@/api/own-settings/putOwnSettings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

import ResetModal from "./ResetModal";

function NotificationSettings({
	data,
	setSettings,
	getData,
}: {
	data: any;
	setSettings: any;
	getData: () => void;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [modal, setModal] = useState<boolean>(false);

	async function updateSettings() {
		try {
			setIsLoading(true);

			let res = await PutOwnSettings({ value: data });

			if (res) {
				localStorage.setItem("userSettings", JSON.stringify(res.result.value));
				// getData();
			}
		} catch {
			toast.error("ذخیره تنظیمات با خطا رو به رو شد!");
		} finally {
			setIsLoading(false);
		}
	}

	async function resetSettingsRequest(data: any) {
		setSettings((prev: any) => ({
			...prev,
			notificationSound: undefined,
			notificationSystemMessage: undefined,
			notificationProject: undefined,
			notificationTasks: undefined,
			notificationTask: undefined,
			notificationTicket: undefined,
		}));

		localStorage.setItem(
			"userSettings",
			JSON.stringify({
				dashboardCalendar: undefined,
				dashboardNotepad: undefined,
				dashboardNotificationCard: undefined,
				dashboardTicketsCard: undefined,
				notificationSound: undefined,
				notificationProject: undefined,
				notificationSystemMessage: undefined,
				notificationTask: undefined,
				notificationTasks: undefined,
				notificationTicket: undefined,
			}),
		);

		const filteredData = omit(data, [
			"notificationSound",
			"notificationSystemMessage",
			"notificationProject",
			"notificationTasks",
			"notificationTask",
			"notificationTicket",
		]);

		try {
			setIsLoading(true);

			let res = await PutOwnSettings({ value: data });

			if (res) {
				getData();
				setModal(false);
			}
		} catch {
			toast.error("ذخیره تنظیمات با خطا رو به رو شد!");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col items-start gap-4">
				<Label className="flex cursor-pointer items-center gap-3">
					<Switch
						checked={
							data?.notificationSound === "true" || !data?.notificationSound
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								notificationSound: value ? "true" : "false",
							}))
						}
					/>
					<span>صدا</span>
				</Label>

				<Label className="flex cursor-pointer items-center gap-3">
					<Switch
						checked={
							data?.notificationSystemMessage === "true" ||
							!data?.notificationSystemMessage
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								notificationSystemMessage: value ? "true" : "false",
							}))
						}
					/>
					<span>پیام های سیستمی</span>
				</Label>

				<Label className="flex cursor-pointer items-center gap-3">
					<Switch
						checked={
							data?.notificationProject === "true" || !data?.notificationProject
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								notificationProject: value ? "true" : "false",
							}))
						}
					/>
					<span>پروژه ها</span>
				</Label>

				<Label className="flex cursor-pointer items-center gap-3">
					<Switch
						checked={
							data?.notificationTasks === "true" || !data?.notificationTasks
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								notificationTasks: value ? "true" : "false",
							}))
						}
					/>
					<span>تسک ها</span>
				</Label>

				<Label className="flex cursor-pointer items-center gap-3">
					<Switch
						checked={
							data?.notificationTask === "true" || !data?.notificationTask
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								notificationTask: value ? "true" : "false",
							}))
						}
					/>
					<span>فرایند ها</span>
				</Label>

				<Label className="flex cursor-pointer items-center gap-3">
					<Switch
						checked={
							data?.notificationTicket === "true" || !data?.notificationTicket
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								notificationTicket: value ? "true" : "false",
							}))
						}
					/>
					<span>تیکت ها</span>
				</Label>
			</div>

			<div className="flex flex-col gap-3 xs:flex-row">
				<Button
					className="min-w-24"
					disabled={isLoading}
					onClick={updateSettings}
				>
					<Spinner loading={isLoading} size="sm">
						بروزرسانی تنظیمات
					</Spinner>
				</Button>

				<ResetModal
					title="اعلانات"
					loading={isLoading}
					submit={() => resetSettingsRequest(data)}
					open={modal}
					setOpen={setModal}
				/>
			</div>
		</div>
	);
}

export { NotificationSettings };
