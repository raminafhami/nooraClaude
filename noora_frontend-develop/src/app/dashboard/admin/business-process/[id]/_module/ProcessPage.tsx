"use client";

import { useCallback, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { Process } from "@/felo/processes/models";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { Layout } from "@/ui/Layout";

import { ProcessInfo } from "./ProcessInfo";
import { ProcessStages } from "./ProcessStages";

export const ProcessPage = ({ processKey }: { processKey: string }) => {
	const [process, setProcess] = useState<Process>();

	const fetchProcessData = useCallback(async () => {
		try {
			const process = await getProcessByKey(processKey);
			if (process) {
				setProcess(process);
			}
		} catch (err) {
			console.error(err);
		}
	}, [processKey]);

	useEffect(() => {
		fetchProcessData();
	}, [fetchProcessData]);

	if (!process) return null;

	return (
		<Layout.Root>
			<Layout.Head title={`${process.name}`}>
				<DynamicLink
					className="ms-auto flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1 text-black transition hover:bg-gray-100 focus:bg-gray-100"
					href="/dashboard/admin?tab=business-process"
				>
					<FaAngleRight className="text-2xs" />
					<span className="ms-1">بازگشت به لیست</span>
				</DynamicLink>
			</Layout.Head>
			<Layout.Content className="grid grid-cols-12 gap-6">
				<ProcessInfo fetchProcessData={fetchProcessData} process={process} />
				<ProcessStages process={process} fetchProcessData={fetchProcessData} />
			</Layout.Content>
		</Layout.Root>
	);
};
