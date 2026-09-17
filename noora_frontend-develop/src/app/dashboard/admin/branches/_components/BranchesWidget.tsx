"use client";

import { useCallback, useState } from "react";

import { Branch } from "@/branches/models/Branch";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";

import { BranchesTable } from "./BranchesTable";
import { BranchInfoForm } from "./BranchInfoForm";
import { BranchManagerForm } from "./BranchManagerForm";

export type FormMode = "add" | "edit" | "manager";

export function BranchesWidget(): React.ReactNode {
  const [branches, setBranches] = useState<Branch[]>([]);

  const [formMode, setFormMode] = useState<FormMode>("add");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const handleBranchesFetch = useCallback((branches: Branch[]): void => {
    setBranches(branches);
  }, []);

  const handleBranchAdd = useCallback(async (branch: Branch) => {
    setBranches((previous) => [branch, ...previous]);
  }, []);

  const handleBranchEdit = useCallback((branch: Branch) => {
    setSelectedBranch({ ...branch });
    setFormMode("edit");
  }, []);

  const handleBranchUpdate = useCallback((branch: Partial<Branch>) => {
    setSelectedBranch((previous) => previous && { ...previous, ...branch });
    setBranches((previous) => [
      ...previous.map((x) => (x.id === branch.id ? { ...x, ...branch } : x)),
    ]);
  }, []);

  const handleManagerChange = useCallback((branch: Branch) => {
    setSelectedBranch({ ...branch });
    setFormMode("manager");
  }, []);

  const handleManagerUpdate = useCallback(
    async (branchId: string, managerId: string | null) => {
      const manager = (
        await getPersonnel({ filters: [{ name: "userId", value: managerId }] })
      ).at(0);

      setBranches((previous) => [
        ...previous.map((x) =>
          x.id === branchId ? { ...x, managerId, manager: manager || null } : x
        ),
      ]);
    },
    []
  );

  const handleChangeCancel = useCallback(() => {
    setSelectedBranch(null);
    setFormMode("add");
  }, []);

  return (
    <div className="grid lg:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-6 gap-y-12 gap-x-12">
      <div className="lg:col-span-1 xl:col-span-2 2xl:col-span-2">
        <div className="max-w-[25rem]">
          {formMode === "add" || formMode === "edit" ? (
            <BranchInfoForm
              branch={selectedBranch}
              onBranchAdd={handleBranchAdd}
              onBranchUpdate={handleBranchUpdate}
              onCancel={handleChangeCancel}
            />
          ) : (
            <BranchManagerForm
              branch={selectedBranch!}
              onCancel={handleChangeCancel}
              onManagerUpdate={handleManagerUpdate}
            />
          )}
        </div>
      </div>
      <div className="lg:col-span-full xl:col-span-full 2xl:col-span-4">
        <BranchesTable
          branches={branches}
          onBranchesFetch={handleBranchesFetch}
          onBranchEdit={handleBranchEdit}
          onManagerChanage={handleManagerChange}
        />
      </div>
    </div>
  );
}
