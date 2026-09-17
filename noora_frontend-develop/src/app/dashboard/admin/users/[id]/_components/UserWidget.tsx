"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";

import { UserInformation } from "./UserInformation";
import { UserNavigation } from "./UserNavigation";
import { UserRoles } from "./UserRoles";

interface Props {
  id: string;
}

export type UserSection = "information" | "roles";

export function UserWidget({ id }: Props) {
  const searchParams = useSearchParams();

  const [section, setSection] = useState<UserSection>(
    (searchParams.get("section") as UserSection) || "information"
  );
  const [version, setVerions] = useState<number>(1);

  function handleChangeSection(s: UserSection) {
    setVerions((prev) => {
      if (s === section) {
        return prev + 1;
      }

      return 1;
    });

    setSection(s);
  }

  return (
    <>
      <UserNavigation section={section} onChange={handleChangeSection} />
      <Section id={id} section={section} version={version} />
    </>
  );
}

function Section({
  id,
  section,
  version,
}: {
  id: string;
  section: UserSection;
  version: number;
}): ReactNode {
  switch (section) {
    case "information":
      return <UserInformation id={id} key={version} />;
    case "roles":
      return <UserRoles id={id} key={version} />;
    default:
      return <></>;
  }
}
