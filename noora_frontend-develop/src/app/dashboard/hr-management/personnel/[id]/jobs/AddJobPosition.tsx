import { useContext, useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/form/Input";
import { JobDescription, JobService } from "@/hrm/jobs";
import { updatePersonnel } from "@/hrm/personnel/services/updatePersonnel";
import { ExpertiseCertificateApi } from "@/hrm/personnelExpertise/models/ExpertiseCertificateApi";
import { createExpertiseCertificate } from "@/hrm/personnelExpertise/services/createExpertiseCertificate";
import {
	createPersonnelExpertise,
	PersonnelExpertiseCreateModel,
} from "@/hrm/personnelExpertise/services/createPersonnelExpertise";
import { Loading } from "@/ui/Loader";
import { ModalContext } from "@/ui/Modal";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { PersonnelContext } from "../_components/PersonnelContext";
import { Expertises } from "./Expertises";
import { ExpertiseAndStatus, JobsContext } from "./JobsContext";

export interface Job {
	id: string;
	name: string;
	metadata: {
		goodsInspectionField?: string;
	};
}

export function AddJobPosition() {
	const [loading, setLoading] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [jobs, setJobs] = useState<JobDescription[]>([]);
	const [academicsJobs, setAcademicJobs] = useState<JobDescription[]>([]);
	const [selectedJob, setSelectedJob] = useState<Job>();
	const { dispatch } = useContext(ModalContext);
	const { personnel, fetchPersonnel } = useContext(PersonnelContext);
	const [showAll, setShowAll] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	useEffect(() => {
		personnel.academics.length && getJobsBasedAcademics();
		getAllJobs();
	}, [personnel.jobs]);

	const [expertisesStatus, setExpertisesStatus] = useState<
		ExpertiseAndStatus[]
	>([]);

	const personnelJobIds = asNavigationProp(personnel.jobs).map((job) => job.id);

	async function getAllJobs() {
		setLoading(true);
		const fetchedJobs = (await JobService.get({
			filters: [
				{
					name: "_id",
					value: {
						$nin: personnelJobIds,
					},
				},
			],
		})) as JobDescription[];
		setJobs(fetchedJobs);
		setLoading(false);
	}

	async function getJobsBasedAcademics() {
		setAcademicJobs([]);
		setLoading(true);
		const fetchedJobs = (await JobService.get({
			filters: [
				{
					name: "$or",
					value: personnel.academics.map((degree) => ({
						"requirements.degree": {
							$elemMatch: { name: degree.name },
						},
					})),
				},
				{
					name: "_id",
					value: {
						$nin: personnelJobIds,
					},
				},
			],
		})) as JobDescription[];
		setAcademicJobs(fetchedJobs);
		setLoading(false);
	}

	async function submitJobAndExpertise() {
		const filteredCertificates = expertisesStatus.filter(
			(certificate) =>
				certificate.organizationName &&
				certificate.file &&
				certificate.certificateDate,
		) as ExpertiseAndStatus[];

		const missingProperties = expertisesStatus.filter(
			(certificate) =>
				!certificate.organizationName ||
				!certificate.file ||
				!certificate.certificateDate,
		);
		const modifiedMissingProperties = missingProperties.map(
			({ title, ...rest }) => rest,
		);
		const modifiedFilteredCertificates = filteredCertificates.map(
			({ title, ...rest }) => rest,
		) as ExpertiseCertificateApi[];

		setButtonLoading(true);
		if (selectedJob) {
			await updatePersonnel(personnel.userId, {
				jobs: [...personnelJobIds, selectedJob.id],
			}).then((res) => {
				if (!res) {
					toast.error(`ارسال اطلاعات شغل ناموفق بود`);
				}
			});
			if (
				missingProperties.length &&
				expertisesStatus.some((expertise) => expertise.status !== undefined)
			) {
				await createPersonnelExpertise(
					modifiedMissingProperties as PersonnelExpertiseCreateModel[],
				).then((res) => {
					if (!res) {
						toast.error(`ارسال اطلاعات مهارت‌ها و دانش‌های فنی ناموفق بود`);
					}
				});
			}
		}

		await Promise.all(
			modifiedFilteredCertificates.map(async (qualifiedExpertise) => {
				const expertiseTitle = filteredCertificates?.find(
					(exp) => exp.expertiseId === qualifiedExpertise.expertiseId,
				)?.title;
				await createExpertiseCertificate(qualifiedExpertise).catch(() => {
					toast.error(`بارگذاری مدرک ${expertiseTitle} ناموفق بود`);
				});
			}),
		);

		setButtonLoading(false);
	}

	const handleSubmit = async () => {
		await submitJobAndExpertise();
		dispatch({ type: "CLOSE" });
		fetchPersonnel(personnel.userId);
	};

	const filteredAcademicJobs = academicsJobs.filter(
		(job) =>
			job.name.includes(searchValue) ||
			job.metadata?.goodsInspectionField?.includes(searchValue),
	);
	const filteredJobs = jobs.filter(
		(job) =>
			job.name.includes(searchValue) ||
			job.metadata?.goodsInspectionField?.includes(searchValue),
	);

	const jobList = showAll ? filteredJobs : filteredAcademicJobs;

	return (
		<JobsContext.Provider
			value={{
				expertisesStatus,
				setExpertisesStatus,
			}}
		>
			<div className="flex w-full flex-col">
				<div className="flex flex-col md:flex-row">
					<div className="md:w-1/3">
						<div className="flex items-center justify-between rounded-xl bg-gray-200 p-5 md:rounded-r-xl">
							<div>سمت‌های شغلی</div>
							<div>
								<label>
									<input
										type="checkbox"
										name="showAll"
										className="mx-1 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-700 ring-0 focus:ring-0 dark:border-gray-600 dark:bg-gray-700"
										checked={showAll}
										onChange={() => {
											setShowAll(!showAll);
										}}
									/>
									نمایش همه
								</label>
							</div>
						</div>

						<div className="scrollbar-thin scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full scrollbar-h-fit right-0 max-h-[550px] overflow-y-auto">
							<Input
								className="w-full border-b border-l-0 border-r-0 border-t-0"
								placeholder="جستجو ..."
								value={searchValue}
								onChange={(e) =>
									setSearchValue(
										e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
									)
								}
							/>
							{jobList.length ? (
								jobList.map((job) => (
									<div
										className={`flex cursor-pointer items-center justify-between border-b border-gray-100 px-5 py-3 text-right transition-all delay-75 ${
											job.id === selectedJob?.id ? "bg-gray-50" : ""
										}`}
										key={job.id}
										onClick={() => {
											setExpertisesStatus([]);
											setSelectedJob({
												id: job.id,
												name: job.name,
												metadata: {
													goodsInspectionField:
														job.metadata?.goodsInspectionField,
												},
											});
										}}
									>
										<div className="flex flex-col justify-center">
											<div className="mb-2 text-xs md:text-sm">{job.name}</div>
											<div className="text-xs text-gray-700 md:text-sm">
												{job.metadata?.goodsInspectionField}
											</div>
										</div>
										<div>
											<FaCheck
												className={`h-7 w-7 rounded-lg p-1 text-lg ${
													job.id === selectedJob?.id ? "" : "hidden"
												}`}
											/>
										</div>
									</div>
								))
							) : loading ? (
								<div className="pt-12 text-center md:pt-52">
									درحال دریافت اطلاعات...
								</div>
							) : (
								<div className="py-12 text-center md:pt-52">
									هیچ سمت شغلی یافت نشد
								</div>
							)}
						</div>
					</div>

					<Expertises jobId={selectedJob?.id} />
				</div>
				<div className="mt-2 flex justify-end">
					<Button
						className="px-20"
						disabled={
							buttonLoading ||
							!expertisesStatus.length ||
							!selectedJob ||
							expertisesStatus.some((expertise) => expertise.status === null) ||
							expertisesStatus.some(
								(expertise) =>
									(expertise.hasOwnProperty("organizationName") &&
										expertise.organizationName === "") ||
									(expertise.hasOwnProperty("certificateDate") &&
										expertise.certificateDate === "") ||
									(expertise.hasOwnProperty("file") &&
										expertise.file === undefined),
							)
						}
						size="lg"
						type="submit"
						variant="primary"
						onClick={handleSubmit}
					>
						{buttonLoading ? <Loading intent="white" size="xs" /> : "ثبت"}
					</Button>
				</div>
			</div>
		</JobsContext.Provider>
	);
}
