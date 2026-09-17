"use client";

import { useCallback, useState } from "react";

import { UserGroup } from "@/identity/groups/models/Group";

import { GroupAddForm } from "./GroupAddForm";
import { GroupsTable } from "./GroupsTable";

export function GroupsWidget(): React.ReactNode {
  const [groups, setGroups] = useState<UserGroup[]>([]);

  const handleGroupsLoad = useCallback((groups: UserGroup[]) => {
    setGroups([...groups]);
  }, []);

  const handleGroupAdd = useCallback((group: UserGroup) => {
    setGroups((previous) => [{ ...group }, ...previous]);
  }, []);

  return (
    <>
      <div className="grid grid-cols-8 gap-x-12">
        <div className="col-span-3">
          <GroupAddForm onGroupAdd={handleGroupAdd} />
        </div>
        <div className="col-span-5">
          <GroupsTable groups={groups} onGroupsLoad={handleGroupsLoad} />
        </div>
      </div>
    </>
  );
}
