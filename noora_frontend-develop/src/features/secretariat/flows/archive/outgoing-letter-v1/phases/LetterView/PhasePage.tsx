"use client";

import { FaCaretLeft } from "react-icons/fa";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Input } from "@/form/Input";
import { routes } from "@/routes";

import { archiveOptions, Assignees, ids, sendTypes } from "../../data";

export function PhasePage() {
	const { task } = useTaskContext();

	const assignees: Assignees | undefined = task.data[ids.assignees];

	function getTemplateUrl(download: boolean): string {
		return new URL(
			`/files/${
				task.instanceId
			}/export/vars/LetterPages?template=sec-letter.preview.html&download=${
				download ? "1" : "0"
			}`,
			routes.externalApi,
		).toString();
	}

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{/* referrer */}
				{task.data[ids.letterReviewByManagerNote] && (
					<div className="col-span-full">
						<Alert variant="info">
							<AlertDescription>
								<div className="font-bold">{assignees!.Manager!.name}:</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.letterReviewByManagerNote]}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				)}

				{/* seperator */}
				{task.data[ids.letterReviewByManagerNote] && (
					<div className="col-span-full">
						<div className="h-1 bg-gray-100"></div>
					</div>
				)}

				{/* letter */}
				<div className="col-span-9 col-start-1 rounded-xl border-e-8 border-s-8 border-gray-200">
					<iframe
						className="h-[32rem] w-full overflow-y-auto rounded-xl border border-gray-200"
						src={getTemplateUrl(false)}
					></iframe>
				</div>

				<div className="col-span-full">
					<a
						className="rounded-lg border border-gray-200 px-4 py-1 leading-8"
						href={getTemplateUrl(true)}
						target="_blank"
					>
						دانلود نامه
					</a>
				</div>

				{/* seperator */}
				<div className="col-span-full mt-5">
					<div className="h-1 bg-gray-100"></div>
				</div>

				{/* inspection */}
				{/* <div className="col-span-3">
          <label>شماره درخواست بازرسی:</label>
          <div className="mt-2">
            <Input
              defaultValue={task.data[ids.relatedInspectionCaseNo]}
              disabled
            />
          </div>
        </div> */}

				{/* order */}
				{task.key === "LetterArchiveBySecretary" && (
					<>
						{/* seperator */}
						<div className="col-span-full mt-5">
							<div className="h-1 bg-gray-100"></div>
						</div>

						{task.data[ids.sendType] && (
							<>
								<div className="col-span-3 col-start-1">
									<label>روش ارسال:</label>
									<div className="mt-2">
										<Input
											defaultValue={
												sendTypes.find(
													(x) => x.value === task.data[ids.sendType],
												)!.label
											}
											disabled
										/>
									</div>
								</div>

								{task.data[ids.sendType] && (
									<>
										<div className="col-span-9 col-start-1 flex rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
											<label>گیرندگان:</label>
											<div className="ms-8">
												{task.data[ids.recipients] &&
												task.data[ids.recipients]!.length !== 0 ? (
													task.data[ids.recipients]!.map(
														(recipient: any, i: number) => (
															<div className="mt-1.5 first:mt-0" key={i}>
																{task.data[ids.sendType] === "physical" ? (
																	<div className="flex items-center">
																		{recipient.name}
																		<FaCaretLeft className="mx-2 h-2 w-2" />
																		{recipient.address}
																	</div>
																) : (
																	<div className="flex items-center">
																		<div>{recipient.address}</div>
																	</div>
																)}
															</div>
														),
													)
												) : (
													<>-</>
												)}
											</div>
										</div>
									</>
								)}
							</>
						)}

						<div className="col-span-3 col-start-1">
							<label>نیاز به بایگانی فیزیکی:</label>
							<div className="mt-2">
								<Input
									defaultValue={
										archiveOptions.find(
											(x) => x.value === task.data[ids.needsToBeArchived],
										)!.label
									}
									disabled
								/>
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
}
