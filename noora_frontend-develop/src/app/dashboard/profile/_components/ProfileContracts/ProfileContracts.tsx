import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { ContractStatusBadge } from "@/hrm/contract/components/ContractStatusBadge";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { Contract } from "@/hrm/contract/models/Contract";
import { getContracts } from "@/hrm/contract/services/getContracts";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ContractDetails } from "./ContractDetails";

function ProfileContracts() {
	const { identity } = useLoggedInUser();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [contracts, setContracts] = useState<Contract[]>();

	useEffect(() => {
		async function loadContracts() {
			try {
				setIsLoading(true);

				const result = await getContracts({
					filters: { "user.id": identity.id },
				});

				setContracts(result);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		}

		loadContracts();
	}, [identity.id]);

	const [selectedContractId, setSelectedContractId] = useState<string>();

	return (
		<div className="space-y-6">
			<div className="flex items-center">
				<div className="flex items-center gap-x-4">
					<div className="text-base">لیست قراردادهای من</div>
				</div>
			</div>

			<Panel.Root>
				<Table.Root>
					<Table.Head>
						<Table.Row className="bg-gray-100 text-right">
							<Table.Cell as="th" className="w-12"></Table.Cell>
							<Table.Cell as="th" className="w-20">
								ردیف
							</Table.Cell>
							<Table.Cell as="th" className="w-64">
								نام
							</Table.Cell>
							<Table.Cell as="th" className="w-44">
								شماره قرارداد
							</Table.Cell>
							<Table.Cell as="th" className="w-44">
								محل کار
							</Table.Cell>
							<Table.Cell as="th" className="w-32">
								مدت قرارداد
							</Table.Cell>
							<Table.Cell as="th" className="w-60">
								تاریخ قرارداد
							</Table.Cell>
							<Table.Cell as="th" className="w-32">
								وضعیت قرارداد
							</Table.Cell>
							<Table.Cell as="th"></Table.Cell>
						</Table.Row>
					</Table.Head>

					<Table.Body>
						{contracts ? (
							contracts.length !== 0 ? (
								contracts.map((contract, index) => {
									const canView =
										contract.status === ContractStatus.Signed ||
										contract.status === ContractStatus.Active ||
										contract.status === ContractStatus.Expired;

									const hasActions = canView;

									return (
										<Table.Row key={contract.id}>
											<Table.Cell>
												{hasActions && (
													<Table.Actions className="w-fit">
														{canView && (
															<Table.Action className="hover:text-blue-500">
																<FaEye
																	onClick={() =>
																		setSelectedContractId(contract.id)
																	}
																/>
															</Table.Action>
														)}
													</Table.Actions>
												)}
											</Table.Cell>
											<Table.Cell>{index + 1}</Table.Cell>
											<Table.Cell>{contract.fullname}</Table.Cell>
											<Table.Cell>
												<span dir="ltr">{contract.contractNo}</span>
											</Table.Cell>
											<Table.Cell>{contract.workplace}</Table.Cell>
											<Table.Cell>{contract.period} ماه</Table.Cell>
											<Table.Cell>
												از {getDatesIngregorian(contract.startDate)} تا{" "}
												{getDatesIngregorian(contract.endDate)}
											</Table.Cell>
											<Table.Cell>
												<ContractStatusBadge status={contract.status} />
											</Table.Cell>
											<Table.Cell></Table.Cell>
										</Table.Row>
									);
								})
							) : (
								<Table.Row key="empty">
									<Table.Cell></Table.Cell>
									<Table.Cell colSpan={100}>قراردادی یافت نشد.</Table.Cell>
								</Table.Row>
							)
						) : isLoading ? (
							<Table.Row key="loading">
								<Table.Cell></Table.Cell>
								<Table.Cell colSpan={100}>
									<Loading size="sm">در حال بارگذاری اطلاعات...</Loading>
								</Table.Cell>
							</Table.Row>
						) : (
							<Table.Row key="error">
								<Table.Cell></Table.Cell>
								<Table.Cell colSpan={100}>
									خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table.Root>
			</Panel.Root>

			{selectedContractId && (
				<ContractDetails contractId={selectedContractId} />
			)}
		</div>
	);
}

function getDatesIngregorian(date: string): string {
	return moment(date, "YYYY-MM-DD").locale("fa").format("jYYYY/jMM/jDD");
}

export { ProfileContracts };
