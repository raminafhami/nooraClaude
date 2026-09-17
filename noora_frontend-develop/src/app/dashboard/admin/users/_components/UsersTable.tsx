"use client";

import { User } from "@/identity/users/models/User";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { UsersTableRow } from "./UsersTableRow";

interface Props {
  items: User[];
  isLoading: boolean;
  error: string | null;
  offset: number;
  onChange: () => void;
}

export function UsersTable({
  items: users,
  isLoading,
  error,
  offset,
  onChange,
}: Props) {
  return (
    <Panel.Root className="overflow-x-auto">
      <Table.Root>
        <Table.Head>
          <Table.Row className="text-right bg-gray-100">
            <Table.Cell as="th" className="w-16">
              ردیف
            </Table.Cell>
            <Table.Cell as="th" className="w-80">
              نام
            </Table.Cell>
            <Table.Cell as="th" className="w-32">
              نوع کاربر
            </Table.Cell>
            <Table.Cell as="th" className="w-48">
              کد ملی
            </Table.Cell>
            <Table.Cell as="th" className="w-48">
              شماره تماس
            </Table.Cell>
            <Table.Cell as="th" className="w-72">
              پست الکترونیک
            </Table.Cell>
            <Table.Cell as="th" className="w-32">
              وضعیت کاربر
            </Table.Cell>
            <Table.Cell as="th"></Table.Cell>
            <Table.Cell as="th" className="w-1">
              عملیات
            </Table.Cell>
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
              <Table.Cell colSpan={100}>{error}</Table.Cell>
            </Table.Row>
          ) : users && users.length !== 0 ? (
            users.map((user, index) => (
              <UsersTableRow
                key={user.id}
                user={user}
                index={offset + index + 1}
                onChange={onChange}
              />
            ))
          ) : (
            <Table.Row key="empty">
              <Table.Cell colSpan={100}>هیچ کاربری وجود ندارد.</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </Panel.Root>
  );
}
