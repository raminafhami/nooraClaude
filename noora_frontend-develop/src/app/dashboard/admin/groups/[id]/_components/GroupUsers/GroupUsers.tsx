"use client";

import { memo } from "react";

import { UsersAddForm } from "./UsersAddForm";
import { UsersTable } from "./UsersTable";

export const GroupUsers = memo(function GroupUsers(): React.ReactNode {
  return (
    <div className="grid grid-cols-8 gap-x-12">
      <div className="col-span-2">
        <UsersAddForm />
      </div>
      <div className="col-span-6">
        <UsersTable />
      </div>
    </div>
  );
});
