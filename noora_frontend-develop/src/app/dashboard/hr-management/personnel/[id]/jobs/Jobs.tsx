import { useContext, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { updatePersonnel } from "@/hrm/personnel/services/updatePersonnel";
import { Loading } from "@/ui/Loader";
import { Modal } from "@/ui/Modal";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { PersonnelContext } from "../_components/PersonnelContext";
import { AddJobPosition } from "./AddJobPosition";

export function Jobs() {
	const [show, setShow] = useState<boolean>(false);
	const { personnel, fetchPersonnel } = useContext(PersonnelContext);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSending, setIsSending] = useState<boolean>(false);

	const [selectedJob, setSelectedJob] = useState<string | undefined>();

	const handleJobRemove = async (jobId: string) => {
		try {
			if (isSending) {
				return;
			}

			setSelectedJob(jobId);

			setIsSending(true);

			await updatePersonnel(personnel.userId, {
				jobs: asNavigationProp(personnel.jobs)
					.filter((x) => x.id !== jobId)
					.map((x) => x.id),
			});

			setIsLoading(true);

			await fetchPersonnel(personnel.userId);
		} catch (err) {
			console.error(err);
		} finally {
			setIsSending(false);
			setIsLoading(false);
			setSelectedJob(undefined);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex">
				<div>
					<Button
						// className="h-fit"
						variant="primary"
						onClick={() => setShow(true)}
					>
						<FaPlus />
						<span>افزودن سمت شغلی</span>
					</Button>

					<Modal
						show={show}
						name="add-jobs"
						size="7xl"
						title="افزودن سمت شغلی"
						content={<AddJobPosition />}
						scrollable="content"
						onClose={() => setShow(false)}
					/>
				</div>
			</div>

			{isLoading && <Loading size="sm">در حال دریافت اطلاعات...</Loading>}

			{!isLoading && (
				<Panel.Root>
					<Table.Root>
						<Table.Head>
							<Table.Row className="bg-gray-100 text-right">
								<Table.Cell as="th" className="w-12" />
								<Table.Cell as="th">عنوان سمت شغلی</Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{asNavigationProp(personnel.jobs).map((job) => (
								<Table.Row key={job.id}>
									<Table.Cell>
										<Table.Actions>
											{selectedJob !== job.id ? (
												<Table.Action
													className="hover:text-red-500"
													onClick={() => handleJobRemove(job.id)}
												>
													<FaTrash />
												</Table.Action>
											) : (
												<Loading horizontalPlacement="center" size="xs" />
											)}
										</Table.Actions>
									</Table.Cell>
									<Table.Cell>
										<div className="font-bold">{job.name}</div>
										<div>{job.metadata?.goodsInspectionField}</div>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</Panel.Root>
			)}
		</div>
	);
}
