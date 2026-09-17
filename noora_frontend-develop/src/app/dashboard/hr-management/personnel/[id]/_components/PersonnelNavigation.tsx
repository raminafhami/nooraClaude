"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { FaFileInvoiceDollar, FaInfo } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoDocumentAttachOutline, IoDocumentText } from "react-icons/io5";
import { MdAddBusiness } from "react-icons/md";
import { TbListDetails } from "react-icons/tb";
import { twMerge } from "tailwind-merge";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { UserType } from "@/identity/users/models/UserType";

import { PersonnelSection } from "./PersonnelWidget";

interface Props {
  section: PersonnelSection;
  onChange: (section: PersonnelSection) => void;
}

interface ItemProps {
  icon: ReactNode;
  name: PersonnelSection;
  text: string;
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
    icon: <IoMdSettings className="text-base" />,
    name: "loginSettings",
    text: "تنظیمات ورود",
    groups: [],
  },
  {
    icon: <MdAddBusiness className="text-base" />,
    name: "jobs",
    text: "شرح‌ شغلی",
    groups: [],
  },
  {
    icon: <IoDocumentText className="text-base" />,
    name: "documents",
    text: "مدارک پرسنل",
    groups: [],
  },
  {
    icon: <FaFileInvoiceDollar className="text-base" />,
    name: "payment-rules",
    text: "قوانین پرداخت",
    groups: [],
  },
];

export function PersonnelNavigation({ section, onChange }: Props) {
  const router = useRouter();
  const { identity } = useLoggedInUser();

  return (
    <>
      <ul className="flex px-4 py-2 border-t-4 border-t-gray-200 rounded-xl bg-gray-100 gap-x-4 overflow-auto scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg">
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
                  "group relative flex min-w-[6rem] h-20 px-2 py-1 rounded-xl text-center bg-gray-200 flex-col gap-y-2 items-center justify-center cursor-pointer transition-all duration-300",
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
    </>
  );
}
