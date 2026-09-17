"use client";

import { memo, ReactNode } from "react";
import { FaUsersCog } from "react-icons/fa";
import { FaMoneyBill } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Identity } from "@/auth/models/Identity";
import { UserType } from "@/identity/users/models/UserType";

import { useBranchContext } from "./BranchContext";
import { BranchSection } from "./BranchWidget";

interface Props {
  section: BranchSection | null;
  onChange: (section: BranchSection) => void;
}

interface ItemProps {
  icon: ReactNode;
  name: BranchSection;
  text: ReactNode;
  groups?: string[];
  authorize?: (identity: Identity, data: any) => boolean;
  condition?: (data: any) => boolean;
}

const items: ItemProps[] = [
  {
    icon: <FaUsersCog className="text-base" />,
    name: "relations",
    text: "ارتباط ها",
    groups: ["system-admin"],
  },
  {
    icon: <FaMoneyBill className="text-base" />,
    name: "paymentRules",
    text: "قوانین پرداخت",
    groups: ["system-admin"],
  },
  {
    icon: <IoDocumentText className="text-base" />,
    name: "branchManagerDocuments",
    text: "مدارک شعبه",
    groups: ["system-admin", "branches-documents"],
  },
];

export const BranchNavigation = memo(function BranchNavigation({
  section,
  onChange,
}: Props) {
  const { identity } = useLoggedInUser();

  const { branch } = useBranchContext();

  return (
    <>
      <div>
        <ul className="flex min-h-[6.25rem] px-4 py-2 border-t-4 border-t-gray-200 rounded-xl bg-gray-100 gap-x-4">
          {items
            .filter(
              (item) =>
                (item.condition?.(branch) ?? true) &&
                (identity.type === UserType.System ||
                  (item.groups &&
                    (item.groups.length === 0 ||
                      item.groups.filter((x) => identity.groups.includes(x))
                        .length !== 0)) ||
                  item.authorize?.(identity, branch)),
            )
            .map((item) => {
              const { icon, name, text } = item;

              return (
                <li
                  className={twMerge(
                    "group relative flex w-24 h-20 px-2 py-1 rounded-xl text-center bg-gray-200 flex-col gap-y-2 items-center justify-center cursor-pointer transition-all duration-300",
                    section === name && "bg-white top-2 rounded-b-none",
                  )}
                  key={name}
                  onClick={() => {
                    onChange(name);
                  }}
                >
                  {icon}
                  <div>{text}</div>
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
});
