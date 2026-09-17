"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import GetOwnSettings from "@/api/own-settings/getOwnSettings";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import DashboardContext from "../../../_module/DashboardContext";
import { DashboardSettings } from "./DashboardSettings";
import { NotificationSettings } from "./NotificationSettings";

function SettingsPage() {
	const { userSettings, setUserSettings } = useContext(DashboardContext);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getUserSettings = useCallback(async () => {
		try {
			setIsLoading(true);

			let res = await GetOwnSettings();

			if (res) {
				setUserSettings(res?.result?.value);
			}
		} catch {
			toast.error("دریافت تنظیمات با مشکل مواجه شد.");
		} finally {
			setIsLoading(false);
		}
	}, [setUserSettings]);

	useEffect(() => {
		getUserSettings();
	}, [getUserSettings]);

	if (isLoading) {
		return <Spinner label="در حال دریافت اطلاعات..." size="sm" />;
	}

	return (
		<div className="space-y-10">
			{/* <div className="space-y-6">
				<div className="flex items-center gap-3">
					<div className="shrink-0 text-base">تنظیمات نمایش</div>
					<Separator className="h-0.5 w-auto grow" />
				</div>

				<DashboardSettings
					data={userSettings}
					setSettings={setUserSettings}
					getData={getUserSettings}
				/>
			</div> */}

			{/* <Separator className="h-0.5" /> */}

			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<div className="shrink-0 text-base">تنظیمات اعلانات</div>
					<Separator className="h-0.5 w-auto grow" />
				</div>

				<NotificationSettings
					data={userSettings}
					setSettings={setUserSettings}
					getData={getUserSettings}
				/>
			</div>
		</div>
	);
}

export default SettingsPage;
