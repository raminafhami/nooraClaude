"use client";

import { FaEye, FaPencilAlt } from "react-icons/fa";

import { DynamicLink } from "@/components/ui/dynamic-link";
import { useRoles } from "@/identity/groups/hooks/useRoles";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";

export function RolesTable() {
	const { isLoading, error, groups: roles } = useRoles();

	return (
		<>
			<Table.Root>
				<Table.Head>
					<Table.Row className="bg-gray-100 text-right">
						<Table.Cell as="th" className="w-16"></Table.Cell>
						<Table.Cell as="th" className="w-64">
							شناسه
						</Table.Cell>
						<Table.Cell as="th" className="w-64">
							عنوان
						</Table.Cell>
						<Table.Cell as="th" className="w-64">
							سرپرست
						</Table.Cell>
						<Table.Cell as="th"></Table.Cell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{isLoading ? (
						<Table.Row key="loading">
							<Table.Cell></Table.Cell>
							<Table.Cell colSpan={100}>
								<Loading size="sm">در حال دریافت اطلاعات...</Loading>
							</Table.Cell>
						</Table.Row>
					) : error ? (
						<Table.Row key="error">
							<Table.Cell></Table.Cell>
							<Table.Cell colSpan={100}>
								دریافت اطلاعات با خطا روبرو شد.
							</Table.Cell>
						</Table.Row>
					) : roles && roles.length !== 0 ? (
						roles.map((role) => (
							<Table.Row key={role.id}>
								<Table.Cell>
									<Table.Actions>
										<Table.Action className="hover:text-blue-500">
											<DynamicLink
												className="flex h-full w-6 items-center justify-center"
												href={`/dashboard/admin/roles/${role.id}`}
											>
												<FaEye />
											</DynamicLink>
										</Table.Action>
										<Table.Action className="hover:text-yellow-500">
											<DynamicLink
												className="flex h-full w-6 items-center justify-center"
												href={`/dashboard/admin/roles/${role.id}/edit`}
											>
												<FaPencilAlt />
											</DynamicLink>
										</Table.Action>
									</Table.Actions>
								</Table.Cell>
								<Table.Cell>{role.name}</Table.Cell>
								<Table.Cell>
									<DynamicLink href={`/dashboard/admin/roles/${role.id}`}>
										{role.title}
									</DynamicLink>
								</Table.Cell>
								<Table.Cell>
									{role.parent
										? roles.find((x) => x.id === role.parent)!.title
										: "-"}
								</Table.Cell>
								<Table.Cell></Table.Cell>
							</Table.Row>
						))
					) : (
						<Table.Row key="empty">
							<Table.Cell></Table.Cell>
							<Table.Cell colSpan={100}>هیچ نقشی وجود ندارد.</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table.Root>
		</>
	);
}
