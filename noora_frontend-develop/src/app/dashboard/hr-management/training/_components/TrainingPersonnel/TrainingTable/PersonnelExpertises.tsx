"use client";

import { memo, useMemo } from "react";

import { ExpertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";

import { PersonnelCertificates } from "./PersonnelCertificates";
import { PersonnelSkills } from "./PersonnelSkills";

// One line of the checklist. `copyIds` holds every row it stands for, so a
// status change is applied to all of them.
export type ChecklistItem = PersonnelExpertise & { copyIds: string[] };

export type PersonnelExpertiseGroupByStatus = {
  [key in PersonnelExpertiseStatus]: ChecklistItem[];
};

interface Props {
  items: PersonnelExpertise[];
  personnel: Personnel;
  showAll: boolean;
}

const normalizeTitle = (title: string | undefined) =>
  (title ?? "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Job descriptions each define their own copy of shared items, so one person
// can hold several rows with the same type and title. Display only: show it
// once, "دارد" if any copy is, otherwise "ندارد" ("در حال یادگیری" copies stay
// hidden as before). The rows themselves are untouched.
function mergeCopies(items: PersonnelExpertise[]): ChecklistItem[] {
  const groups = new Map<string, PersonnelExpertise[]>();
  for (const item of items) {
    const key = `${item.type}|${normalizeTitle(item.title)}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.values()].map((copies) => {
    const shown =
      copies.find((x) => x.status === PersonnelExpertiseStatus.Qualified) ??
      copies.find((x) => x.status === PersonnelExpertiseStatus.Unqualified) ??
      copies[0];
    return { ...shown, copyIds: copies.map((x) => x.id) };
  });
}

export const PersonnelExpertises = memo(function PersonnelExpertises({
  items,
  personnel,
  showAll,
}: Props): React.ReactNode {
  const groupedItems = useMemo(() => {
    return mergeCopies(items).reduce(
      (
        acc: {
          [key in ExpertiseType]: PersonnelExpertiseGroupByStatus;
        },
        item: ChecklistItem,
      ) => {
        const key = item.type as ExpertiseType;

        if (acc[key]) {
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
        knowledge: { unqualified: [], qualified: [], learning: [] },
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
        <PersonnelSkills
          items={groupedItems.knowledge}
          personnel={personnel}
          showAll={showAll}
          label="دانش فنی"
          emptyText="دانش فنی‌ای یافت نشد."
        />
      </div>
    </>
  );
});
