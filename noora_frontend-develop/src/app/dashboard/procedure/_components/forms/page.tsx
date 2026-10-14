"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CompletedFormsReport } from "./_components/CompletedFormsReport";
import { FormsManagement } from "./_components/FormsManagement";

export default function FormsPage() {
	return (
		<Tabs defaultValue="management" className="w-full select-none">
			<TabsList className="h-max w-full flex-row-reverse justify-start py-2">
				<TabsTrigger className="mx-1 rounded-xl px-4 py-3" value="management">
					مدیریت فرم‌ها
				</TabsTrigger>
				<TabsTrigger className="mx-1 rounded-xl px-4 py-3" value="completed">
					فرم‌های تکمیل‌شده
				</TabsTrigger>
			</TabsList>
			<TabsContent value="management" dir="rtl">
				<FormsManagement />
			</TabsContent>
			<TabsContent value="completed" dir="rtl">
				<CompletedFormsReport />
			</TabsContent>
		</Tabs>
	);
}
