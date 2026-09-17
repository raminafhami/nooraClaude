import moment from "jalali-moment";
import { useEffect, useState } from "react";

import GetFormById from "@/api/forms/getFormById";
import { Layout } from "@/ui/Layout";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

interface FormResultsModalProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	formId: string;
}

interface User {
	branchId: string | null;
	name: string;
	lastname: string;
	username: string;
	nationalCode: string;
	email: string | null;
	phoneNo: string;
	id: string;
}

interface Submission {
	avgScore: number;
	status: string;
	id: string;
}

export interface TargetUser {
	submissionId: string | null;
	user: User;
	submission: Submission | null;
}

interface Question {
	title: string;
	questionId: string;
	id: string;
}

interface Form {
	title: string;
	certificateCode: string;
	formNo: string;
	evaluator: string;
	targetUsers: TargetUser[];
	questions: Question[];
	startEvalNumber: number;
	endEvalNumber: number;
	endDate: string;
	createdAt: string;
	updatedAt: string;
	id: string;
}

export default function FormResultsModal({
	isShow,
	setShow,
	formId,
}: FormResultsModalProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [formAttribute, setFormAttribute] = useState<any>();
	const [users, setUsers] = useState<Form[]>([]);

	async function getFormResult() {
		setLoading(true);
		try {
			let response = await GetFormById({ id: formId });
			if (response) {
				setUsers([response.result]);
			}
		} catch (e) {}
	}

	useEffect(() => {
		getFormResult();
	}, []);
	return (
		<>
			{
				<MyModal
					size="4xl"
					title="نتایج"
					content={
						<>
							<Layout.Content className="mt-10 select-none p-0">
								<Panel.Root>
									<Panel.Container className="overflow-y-scroll">
										<Table.Root>
											<Table.Head>
												<Table.Cell>ردیف</Table.Cell>
												<Table.Cell>نام</Table.Cell>
												<Table.Cell>وضعیت</Table.Cell>
												<Table.Cell>نمره نهایی</Table.Cell>
												<Table.Cell>تاریخ</Table.Cell>
											</Table.Head>
											<Table.Body>
												{users?.length ? (
													users.map((user, index) =>
														user.targetUsers.map((targetUser, index) =>
															targetUser.submission?.avgScore ? (
																<Table.Row key={index}>
																	<Table.Cell>{index + 1}</Table.Cell>
																	<Table.Cell>
																		{targetUser.user?.name}{" "}
																		{targetUser.user?.lastname}
																	</Table.Cell>
																	<Table.Cell>
																		{targetUser.submission.status}
																	</Table.Cell>
																	<Table.Cell>
																		{targetUser?.submission?.avgScore &&
																			toFarsiNum(
																				targetUser.submission.avgScore?.toLocaleString(),
																			)}
																	</Table.Cell>
																	<Table.Cell>
																		{users[0]?.createdAt
																			? moment(users[0].createdAt)
																					.locale("fa")
																					.format("YYYY/MM/DD")
																			: "-"}
																	</Table.Cell>
																</Table.Row>
															) : (
																""
															),
														),
													)
												) : (
													<Table.Row>
														<Table.Cell>موردی یافت نشد!</Table.Cell>
														<Table.Cell></Table.Cell>
														<Table.Cell></Table.Cell>
													</Table.Row>
												)}
											</Table.Body>
										</Table.Root>
									</Panel.Container>
								</Panel.Root>
							</Layout.Content>
						</>
					}
					name="addParticipant"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
			{/* <>
                <AiOutlineUsergroupAdd
                    data-tooltip-id="addParticipantModal"
                    size={20}
                    className="inline-flex text-blue-500 cursor-pointer outline-0 ml-2"
                    onClick={() => addModalOnOpen()}
                />
            </> */}
		</>
	);
}
