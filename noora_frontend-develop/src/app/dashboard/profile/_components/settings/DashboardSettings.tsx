"use client";

import { omit } from "lodash";
import { useState } from "react";
import { toast } from "sonner";

import PutOwnSettings from "@/api/own-settings/putOwnSettings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loading } from "@/ui/Loader";

import ResetModal from "./ResetModal";

function DashboardSettings({
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
		setIsLoading(true);
		try {
			let res = await PutOwnSettings({ value: data });
			if (res) {
				setTimeout(() => {
					// getData();
					setIsLoading(false);
				}, 300);
			}
		} catch {
			setIsLoading(false);
			toast.error("ذخیره تنظیمات با خطا رو به رو شد!");
		}
	}
	async function resetSettingContext() {
		setSettings((prev: any) => ({
			...prev,
			dashboardNotepad: undefined,
			dashboardTicketsCard: undefined,
			dashboardNotificationCard: undefined,
			dashboardCalendar: undefined,
			menuStyle: "first",
		}));
		return data;
	}

	async function sendSettingsRequest(data: any) {
		setIsLoading(true);
		try {
			let res = await PutOwnSettings({ value: data });
			if (res) {
				setTimeout(() => {
					getData();
					setIsLoading(false);
					setModal(false);
				}, 300);
			}
		} catch {
			setIsLoading(false);
			toast.error("ذخیره تنظیمات با خطا رو به رو شد!");
		}
	}

	async function resetSettingsRequest(data: any) {
		await resetSettingContext();
		const filteredData = omit(data, [
			"dashboardNotepad",
			"dashboardTicketsCard",
			"dashboardNotificationCard",
			"dashboardCalendar",
			"menuStyle",
		]);
		await sendSettingsRequest(filteredData);
	}

	return (
		<>
			<div className="ms-5">
				<div className="my-4 flex items-center space-x-2">
					<Label className="ml-2 w-32" htmlFor="dashboardCalendar">
						حالت منو:
					</Label>
					<Select
						defaultValue="first"
						value={data?.menuStyle}
						onValueChange={(value) =>
							setSettings((prev: any) => ({ ...prev, menuStyle: value }))
						}
					>
						<SelectTrigger className="w-fit">
							<p className="mx-6">
								{data?.menuStyle
									? data?.menuStyle === "first"
										? "پیوسته"
										: data?.menuStyle === "second"
											? "تکی"
											: "بالا"
									: "انتخاب"}
							</p>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="first">پیوسته</SelectItem>
							<SelectItem value="second">تکی</SelectItem>
							<SelectItem value="third">بالا</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="my-4 flex items-center space-x-2">
					<Label className="ml-2 w-32" htmlFor="notepad">
						دست نویس:
					</Label>
					<Switch
						id="dashboardNotepad"
						checked={
							data?.dashboardNotepad === "true" || !data?.dashboardNotepad
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								dashboardNotepad: value ? "true" : "false",
							}))
						}
					/>
				</div>

				<div className="my-4 flex items-center space-x-2">
					<Label className="ml-2 w-32" htmlFor="notepad">
						تیکت های من:
					</Label>
					<Switch
						id="dashboardTicketsCard"
						checked={
							data?.dashboardTicketsCard === "true" ||
							!data?.dashboardTicketsCard
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								dashboardTicketsCard: value ? "true" : "false",
							}))
						}
					/>
				</div>

				<div className="my-4 flex items-center space-x-2">
					<Label className="ml-2 w-32" htmlFor="notepad">
						پیام های سیستمی:
					</Label>
					<Switch
						id="dashboardNotificationCard"
						checked={
							data?.dashboardNotificationCard === "true" ||
							!data?.dashboardNotificationCard
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								dashboardNotificationCard: value ? "true" : "false",
							}))
						}
					/>
				</div>

				<div className="my-4 flex items-center space-x-2">
					<Label className="ml-2 w-32" htmlFor="dashboardCalendar">
						ساعت و تقویم:
					</Label>
					<Switch
						id="dashboardCalendar"
						checked={
							data?.dashboardCalendar === "true" || !data?.dashboardCalendar
						}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								dashboardCalendar: value ? "true" : "false",
							}))
						}
					/>
				</div>

				<div className="my-4 flex items-center space-x-2">
					<Label className="ml-2 w-32" htmlFor="internalPhoneNo">
						شماره های داخلی:
					</Label>
					<Switch
						id="internalPhoneNo"
						checked={data?.internalPhoneNo === "true" || !data?.internalPhoneNo}
						onCheckedChange={(value: boolean) =>
							setSettings((prev: any) => ({
								...prev,
								internalPhoneNo: value ? "true" : "false",
							}))
						}
					/>
				</div>
			</div>

			<div className="flex w-full">
				<Button
					className="float-left w-20"
					onClick={updateSettings}
					disabled={isLoading}
				>
					{isLoading ? (
						<Loading verticalPlacement="center" horizontalPlacement="center" />
					) : (
						"ذخیره"
					)}
				</Button>

				<ResetModal
					setOpen={setModal}
					open={modal}
					submit={() => resetSettingsRequest(data)}
					loading={isLoading}
					title="پیشخوان"
				/>
			</div>
		</>
	);
}

export { DashboardSettings };
