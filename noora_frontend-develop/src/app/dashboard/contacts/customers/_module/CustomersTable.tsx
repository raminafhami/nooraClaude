"use client";

import { ReactNode, useCallback, useState } from "react";

import ManageCreditModal from "@/app/dashboard/hr-management/personnel/_components/modal/ManageCreditModal";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { User } from "@/identity/users/models/User";

import { CustomersTableRow } from "./CustomersTableRow";
import { UserAndRelations } from "./UserAndRelation";

function CustomersTable({
	customers,
	loading,
	offset,
	pagination,
}: {
	customers: UserAndRelations[];
	loading: boolean;
	offset: number;
	pagination: ReactNode;
}) {
	const { identity } = useLoggedInUser();

	const canChangeCredit = identity.groups.includes("credit-manager");

	const [creditDialog, setCreditDialog] = useState<User>();

	const handleCreditDialogOpen = useCallback((customer: User) => {
		setCreditDialog(customer);
	}, []);

	const handleCreditDialogClose = useCallback(() => {
		setCreditDialog(undefined);
	}, []);

	return (
		<>
			{creditDialog && (
				<ManageCreditModal
					data={
						{
							userId: creditDialog.id,
							fullname: creditDialog.fullname,
						} as Personnel
					}
					setShow={handleCreditDialogClose}
					isShow={!!creditDialog}
				/>
			)}

			<Table
				loading={loading}
				pagination={pagination}
				slotProps={{
					root: { className: "border-x-0 rounded-none" },
				}}
			>
				<TableHeader>
					<TableRow>
						<TableHead className="w-1">#</TableHead>
						<TableHead>نام</TableHead>
						<TableHead className="w-36">کد ملی</TableHead>
						<TableHead className="w-36">شماره همراه</TableHead>
						<TableHead className="w-56">پست الکترونیک</TableHead>
						<TableHead className="w-64">هماهنگ کننده</TableHead>
						<TableHead className="w-64">بازاریاب</TableHead>
						<TableHead className="w-1">عملیات</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{customers.length ? (
						customers.map(
							({ user: customer, coordinator, marketer }, index) => (
								<CustomersTableRow
									key={customer.id}
									customer={customer}
									coordinator={coordinator}
									marketer={marketer}
									index={offset + index}
									canChangeCredit={canChangeCredit}
									onCredit={handleCreditDialogOpen}
								/>
							),
						)
					) : (
						<TableRow>
							<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}

export { CustomersTable };
