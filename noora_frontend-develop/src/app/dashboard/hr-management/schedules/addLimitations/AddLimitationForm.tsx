"use client";

import { MaskInput } from "@/form/MaskInput";

import { Limitations } from "./AddLimitations";

function AddLimitationForm({
	onLimitationsChange,
	limitations,
}: {
	limitations: Limitations;
	onLimitationsChange: (
		change:
			| {
					maxDayLeave: Limitations["maxDayLeave"];
			  }
			| {
					maxExtraTime: Limitations["maxExtraTime"];
			  }
			| {
					maxManualTime: Limitations["maxManualTime"];
			  },
	) => void;
}) {
	return (
		<div className="flex w-full flex-col justify-between gap-y-3">
			<div className="flex items-center justify-center gap-2">
				<label htmlFor="maxExtraTime" className="min-w-[8rem]">
					حداکثر اضافه کاری در روز:
				</label>
				<div className="h-10 grow">
					<MaskInput
						className="text-right tracking-widest"
						dir="ltr"
						id="maxExtraTime"
						mask="00{:}00"
						value={limitations.maxExtraTime}
						maskOptions={{ lazy: false }}
						onBlur={() => {}}
						onMutate={(v) => {
							onLimitationsChange({ maxExtraTime: v + ":00" });
						}}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center gap-2">
				<label htmlFor="maxManualTime" className="min-w-[8rem]">
					حداکثر تایم دستی در ماه:
				</label>
				<div className="h-10 grow">
					<MaskInput
						className="text-right tracking-widest"
						dir="ltr"
						id="maxManualTime"
						mask={/^\d+$/}
						value={limitations.maxManualTime + ""}
						onBlur={() => {}}
						onMutate={(v) => {
							onLimitationsChange({ maxManualTime: +v });
						}}
					/>
				</div>
			</div>
			<div className="flex items-center justify-center gap-2">
				<label htmlFor="maxDayLeave" className="min-w-[8rem]">
					حداکثر مرخصی در ماه:
				</label>
				<div className="h-10 grow">
					<MaskInput
						className="text-right tracking-widest"
						dir="ltr"
						id="maxDayLeave"
						mask={/^\d+$/}
						value={limitations.maxDayLeave + ""}
						onBlur={() => {}}
						onMutate={(v) => {
							onLimitationsChange({ maxDayLeave: +v });
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default AddLimitationForm;
