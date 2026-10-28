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
  // opens the certificate dialog for one training item
  onUploadCertificate: (item: ChecklistItem) => void;
}

const normalizeTitle = (title: string | undefined) =>
  (title ?? "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/‌/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Older job descriptions could hold their own copy of a shared item, so one
// person may have several rows with the same type and title. Display only:
// show it once with the furthest status of its copies (دارد, then در حال
// آموزش, then ندارد). The rows themselves are untouched.
const STATUS_RANK: Record<string, number> = {
  [PersonnelExpertiseStatus.Unqualified]: 0,
  [PersonnelExpertiseStatus.Learning]: 1,
  [PersonnelExpertiseStatus.Qualified]: 2,
};

function mergeCopies(items: PersonnelExpertise[]): ChecklistItem[] {
  const groups = new Map<string, PersonnelExpertise[]>();
  for (const item of items) {
    const key = `${item.type}|${normalizeTitle(item.title)}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.values()].map((copies) => {
    const shown = copies.reduce((best, x) =>
      (STATUS_RANK[x.status ?? ""] ?? 0) > (STATUS_RANK[best.status ?? ""] ?? 0)
        ? x
        : best,
    );
    return { ...shown, copyIds: copies.map((x) => x.id) };
  });
}

export const PersonnelExpertises = memo(function PersonnelExpertises({
  items,
  personnel,
  showAll,
  onUploadCertificate,
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

        if (acc[key] && item.status && acc[key][item.status]) {
          acc[key][item.status].push(item);
        }

        return acc;
      },
      // listed in this order: ندارد, در حال آموزش, دارد
      {
        certificate: { unqualified: [], learning: [], qualified: [] },
        skill: { unqualified: [], learning: [], qualified: [] },
        knowledge: { unqualified: [], learning: [], qualified: [] },
      },
    );
  }, [items]);

  return (
    <>
      <div className="space-y-3">
        <PersonnelCertificates
          items={groupedItems.certificate}
          showAll={showAll}
          onUpload={onUploadCertificate}
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
