"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FaInfo, FaUserCog } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

import { UserSection } from "./UserWidget";

interface Props {
  section: UserSection;
  onChange: (section: UserSection) => void;
}

interface ItemProps {
  icon: ReactNode;
  name: UserSection;
  text: string;
}

const items: ItemProps[] = [
  {
    icon: <FaInfo className="text-base" />,
    name: "information",
    text: "اطلاعات",
  },
  {
    icon: <FaUserCog className="text-base" />,
    name: "roles",
    text: "نقش ها",
  },
];

export function UserNavigation({ section, onChange }: Props) {
  const router = useRouter();

  return (
    <>
      <div>
        <ul className="flex px-4 py-2 border-t-4 border-t-gray-200 rounded-xl bg-gray-100 gap-x-4">
          {items.map((item) => {
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

                  const url = new URL(window.location.href);
                  url.searchParams.set("section", name);
                  router.replace(url.toString());
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
