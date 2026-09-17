"use client";

import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/ui/Layout";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import AuditPage from "./_components/audit/page";
import EvalutaionPage from "./_components/evaluation-form/page";
import { ProcedureTabs } from "./_components/modules/AuditTypes";
import SubContractorsPage from "./_components/subcontractors/page";

export default function ProcedurePage() {
	return (
		<Layout.Root>
			<Layout.Head title={toFarsiNum("تضمین کیفیت")}></Layout.Head>
			<Layout.Content>
				<Tabs defaultValue="instructions" className="w-full select-none">
					<TabsList className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full scrollbar-h-fit h-max w-full flex-row-reverse justify-start overflow-x-auto py-2">
						{ProcedureTabs.map((tabs, index) => (
							<TabsTrigger
								key={index}
								className="mx-1 rounded-xl px-4 py-3"
								value={tabs.value}
							>
								{React.createElement(tabs.icon, {
									size: 20,
									className: `ml-2 ${tabs.color}`,
								})}
								<span className="my-2 whitespace-break-spaces">
									{tabs.name}
								</span>
							</TabsTrigger>
						))}
					</TabsList>
					<TabsContent value="instructions" dir="rtl">
						<AuditPage />
					</TabsContent>
					<TabsContent value="audit" dir="rtl">
						<AuditPage isRisk filters={{ category: "ممیزی داخلی" }} />
					</TabsContent>
					<TabsContent value="monitors" dir="rtl">
						<EvalutaionPage />
					</TabsContent>
					<TabsContent value="subcontractors" dir="rtl">
						<SubContractorsPage />
					</TabsContent>
				</Tabs>
			</Layout.Content>
		</Layout.Root>
	);
}
