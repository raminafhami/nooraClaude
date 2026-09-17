"use client";

import { useCallback, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Indicator } from "@/indicator/models/Indicator";
import { getIndicators } from "@/indicator/services/getIndicators";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";

import { IndicatorsForm } from "./IndicatorsForm";
import { IndicatorsTable } from "./IndicatorsTable";

function IndicatorsWidget() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [indicators, setIndicators] = useState<Indicator[]>();

	const loadIndicators = useCallback(async () => {
		try {
			setIsLoading(true);
			setErrorMessage(null);

			const indicators = await getIndicators({
				filters: { key: { $ne: "BuyerCode" } },
				sort: { title: "asc" },
			});
			setIndicators(indicators);
		} catch (err: any) {
			console.error(err);
			setErrorMessage("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadIndicators();
	}, [loadIndicators]);

	const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(
		null,
	);

	const handleIndicatorCreateOrUpdate = useCallback(() => {
		setEditingIndicator(null);
	}, []);

	const handleIndicatorEdit = useCallback((indicator: Indicator) => {
		setEditingIndicator(indicator);
	}, []);

	const handleIndicatorEditCancel = useCallback(() => {
		setEditingIndicator(null);
	}, []);

	if (typeof indicators === "undefined") {
		if (isLoading) {
			return <Loading>در حال دریافت اطلاعات...</Loading>;
		}

		return (
			<DestructiveAlert className="max-w-fit">
				<AlertDescription>{errorMessage}</AlertDescription>
			</DestructiveAlert>
		);
	}

	return (
		<Layout.Root>
			<Layout.Content>
				<div className="grid grid-cols-8 gap-x-6 xl:gap-x-12">
					<div className="col-span-2">
						<IndicatorsForm
							key={editingIndicator?.id ?? null}
							indicator={editingIndicator}
							refreshFn={loadIndicators}
							onCreateOrUpdate={handleIndicatorCreateOrUpdate}
							onCancel={handleIndicatorEditCancel}
						/>
					</div>

					<div className="col-span-6">
						<IndicatorsTable
							indicators={indicators}
							editingIndicator={editingIndicator}
							loading={isLoading}
							errorMessage={errorMessage}
							refreshFn={loadIndicators}
							onEdit={handleIndicatorEdit}
						/>
					</div>
				</div>
			</Layout.Content>
		</Layout.Root>
	);
}

export { IndicatorsWidget };
