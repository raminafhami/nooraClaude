"use client";

import { useEffect, useState } from "react";
import { FaSquare } from "react-icons/fa";

import { Input } from "@/form/Input";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroupById } from "@/identity/groups/services/getGroupById";
import { Loading } from "@/ui/Loader";

interface Props {
  id: string;
}

export function RoleInformation({ id }: Props) {
  const [role, setRole] = useState<UserGroup>();
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setRole(undefined);
    setError(false);
    getGroupById(id, "permissions parent children users")
      .then((result) => { if (active) setRole(result); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [id]);

  if (error) return <p role="alert">دریافت جزئیات نقش انجام نشد.</p>;
  if (!role) {
    return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
  }

  return (
    <div className="grid grid-cols-12 gap-x-10 gap-y-6">
      <div className="col-span-3 col-start-1">
        <label>عنوان:</label>
        <Input className="mt-2" defaultValue={role.title} disabled />
      </div>

      <div className="col-span-3 col-start-1">
        <label>نام:</label>
        <Input className="mt-2" defaultValue={role.name} disabled />
      </div>

      <div className="col-span-3 col-start-1">
        <label>نقش پدر:</label>
        <div className="mt-2">
          <Input
            className="mt-2"
            defaultValue={(typeof role.parent === "object" && role.parent?.title) || "-"}
            disabled
          />
        </div>
      </div>

      <div className="col-span-3 col-start-1">
        <label>زیر نقش ها:</label>
        <div className="mt-2 space-y-1.5 ps-4">
          {(role.children &&
            role.children.length !== 0 &&
            role.children?.map((child) => (
              <div className="flex items-center gap-x-2" key={child.id}>
                <FaSquare className="text-[.375rem]" />
                {child.title}
              </div>
            ))) ||
            "زیر نقشی وجود ندارد."}
        </div>
      </div>

      <div className="col-span-3 col-start-1">
        <label>کاربران:</label>
        <div className="mt-2 space-y-1.5 ps-4">
          {(role.users &&
            role.users.length !== 0 &&
            role.users.map((user) => (
              <div className="flex items-center gap-x-2" key={user.id}>
                <FaSquare className="text-[.375rem]" />
                {user.fullname}
              </div>
            ))) ||
            "کاربری در این نقش وجود ندارد."}
        </div>
      </div>

      <div className="col-span-6 col-start-1">
        <label>دسترسی‌ها:</label>
        <div className="mt-2 space-y-1.5 ps-4">
          {(role.permissions &&
            role.permissions.length !== 0 &&
            role.permissions.map((permission) => (
              <div
                className="flex items-center gap-x-2"
                key={typeof permission === "string" ? permission : permission.id}
              >
                <FaSquare className="text-[.375rem]" />
                {typeof permission === "string"
                  ? permission
                  : permission.description || permission.subject}
              </div>
            ))) ||
            "دسترسی‌ای برای این نقش تعریف نشده."}
        </div>
      </div>
    </div>
  );
}
