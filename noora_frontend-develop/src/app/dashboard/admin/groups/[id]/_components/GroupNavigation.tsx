"use client";

import { ReactNode } from "react";
import { FaInfo, FaUsers } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { UserType } from "@/identity/users/models/UserType";

import { GroupSection } from "./GroupWidget";

interface Props {
  section: GroupSection;
  onChange: (section: GroupSection) => void;
}

interface ItemProps {
  icon: ReactNode;
  name: GroupSection;
  text: ReactNode;
  groups?: string[];
}

const items: ItemProps[] = [
  {
    icon: <FaInfo className="text-base" />,
    name: "information",
    text: "اطلاعات",
    groups: [],
  },
  {
    icon: <FaUsers className="text-base" />,
    name: "users",
    text: "افراد",
    groups: [],
  },
];

export function GroupNavigation({ section, onChange }: Props) {
  const { identity } = useLoggedInUser();

  return (
    <>
      <div>
        <ul className="flex px-4 py-2 border-t-4 border-t-gray-200 rounded-xl bg-gray-100 gap-x-4">
          {items
            .filter(
              (item) =>
                identity!.type === UserType.System ||
                (item.groups &&
                  (item.groups.length === 0 ||
                    item.groups.filter((x) => identity!.groups.includes(x))
                      .length !== 0)),
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
}
