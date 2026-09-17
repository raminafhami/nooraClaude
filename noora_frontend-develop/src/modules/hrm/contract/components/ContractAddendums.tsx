"use client";

import moment from "jalali-moment";
import { useState } from "react";

import { JobDescription } from "@/hrm/jobs/models/JobDescription";
import downloadJobTemplate from "@/hrm/jobs/utils/downloadJobTemplate";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { cn } from "@/lib/utils";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";
import { ObjectType } from "@/utils/object/ObjectType";

import { Contract } from "../models/Contract";

interface Props {
	className?: string;
	contract: Contract;
	personnel: Personnel;
	jobs: JobDescription[];
	signatures?: Partial<ObjectType<"personnel" | "qa">>;
}

function ContractAddendums({
	className,
	contract,
	personnel,
	jobs,
	signatures = {},
}: Props) {
	const [isDownloading, setIsDownloading] = useState<boolean>(false);

	return (
		<div className={cn("space-y-2", className)}>
			<label>الحاقیه ها:</label>
			<ul className="space-y-2 ps-4">
				{jobs.map((job, index) => {
					let jobName = job.name;
					if (job.metadata?.goodsInspectionField) {
						jobName += ` (${job.metadata.goodsInspectionField})`;
					}

					return (
						<li
							key={job.id}
							className="flex cursor-pointer items-center gap-3"
							onClick={async () => {
								if (isDownloading) {
									return;
								}

								try {
									setIsDownloading(true);
									await downloadJobTemplate(job.id, {
										personnel: signatures.personnel,
										approver: signatures.qa,
									});
								} catch (err) {
									console.error(err);
								} finally {
									setIsDownloading(false);
								}
							}}
						>
							<span
								className={cn(
									"cursor-pointer underline",
									isDownloading && "cursor-wait",
								)}
							>
								{index + 1}- شرح سمت شغلی {jobName}
							</span>
						</li>
					);
				})}

				<li
					className="flex cursor-pointer items-center gap-3"
					onClick={async () => {
						if (isDownloading) {
							return;
						}

						try {
							setIsDownloading(true);
							await downloadTemplate({
								name: "hr/CodeOfEthics.html",
								data: {
									name: personnel.fullname,
									nationalCode: personnel.nationalCode,
									date: signatures.personnel
										? moment(contract.signDate, "YYYY/MM/DD").format(
												"jYYYY/jMM/jDD",
											)
										: undefined,
									signature: signatures.personnel,
								},
								output: `تعهدنامه رعایت بی طرفی، استقلال و محرمانگی - ${personnel.fullname}`,
							});
						} catch (err) {
							console.error(err);
						} finally {
							setIsDownloading(false);
						}
					}}
				>
					<span
						className={cn(
							"cursor-pointer underline",
							isDownloading && "cursor-wait",
						)}
					>
						{jobs.length + 1}- تعهدنامه رعایت بی طرفی، استقلال و محرمانگی
					</span>
				</li>
			</ul>
		</div>
	);
}

export { ContractAddendums };
