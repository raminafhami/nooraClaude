"use client";

import { memo, useMemo } from "react";

import { ExpertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";

import { PersonnelCertificates } from "./PersonnelCertificates";
import { PersonnelSkills } from "./PersonnelSkills";

export type PersonnelExpertiseGroupByStatus = {
  [key in PersonnelExpertiseStatus]: PersonnelExpertise[];
};

interface Props {
  items: PersonnelExpertise[];
  personnel: Personnel;
  showAll: boolean;
}

export const PersonnelExpertises = memo(function PersonnelExpertises({
  items,
  personnel,
  showAll,
}: Props): React.ReactNode {
  const groupedItems = useMemo(() => {
    return items.reduce(
      (
        acc: {
          [key in "certificate" | "skill"]: PersonnelExpertiseGroupByStatus;
        },
        item: PersonnelExpertise,
      ) => {
        const key = item.type as ExpertiseType;

        if (key !== "knowledge") {
          if (item.status === "unqualified") {
            acc[key].unqualified.push(item);
          } else if (item.status === "qualified") {
            acc[key].qualified.push(item);
          }
        }

        return acc;
      },
      {
        certificate: { unqualified: [], qualified: [], learning: [] },
        skill: { unqualified: [], qualified: [], learning: [] },
      },
    );
  }, [items]);

  return (
    <>
      <div className="space-y-3">
        <PersonnelCertificates
          items={groupedItems.certificate}
          showAll={showAll}
        />
        <PersonnelSkills
          items={groupedItems.skill}
          personnel={personnel}
          showAll={showAll}
        />
      </div>
    </>
  );
});
