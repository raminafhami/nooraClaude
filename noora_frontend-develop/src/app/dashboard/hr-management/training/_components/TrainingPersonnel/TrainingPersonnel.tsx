"use client";

import { useCallback, useEffect, useState } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { PersonnelExpertise } from "@/hrm/personnelExpertise/models/PersonnelExpertise";
import { PersonnelExpertise as PersonExpertise } from "@/hrm/personnel/models/PersonnelExpertise";

import { TrainingContext } from "./TrainingContext";
import { TrainingTable } from "./TrainingTable/TrainingTable";

interface SearchAttributeProps {
  expertiseId?: string;
}

export function TrainingPersonnel() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [personnelInfo, setPersonnelInfo] = useState<Personnel[]>([]);

  const [searchAttribute, setSearchAttribute] =
    useState<SearchAttributeProps>();

  async function getExpertises() {
    setLoading(true);

    const personnel = await getPersonnel({
      populate: ["expertises", "jobs"],
    });
    setPersonnelInfo(personnel);

    setLoading(false);
  }

  const handleExpertiseUpdate = useCallback(
    (personnelId: string, expertise: PersonnelExpertise) => {
      setPersonnelInfo((previous) => [
        ...previous.map((x) =>
          x.id !== personnelId
            ? x
            : {
                ...x,
                expertises: x.expertises!.map((y) =>
                  y.id !== expertise.id ? y : { ...y, status: expertise.status }
                ),
              }
        ),
      ]);
    },
    []
  );

  const handleExpertiseAdd = useCallback(
    (personnelId: string, expertise: PersonExpertise) => {
      setPersonnelInfo((previous) => [
        ...previous.map((x) =>
          x.id !== personnelId
            ? x
            : {
                ...x,
                expertises: [...x.expertises!, { ...expertise }],
              }
        ),
      ]);
    },
    []
  );

  useEffect(() => {
    getExpertises();
  }, []);

  return (
    <>
      <TrainingContext.Provider
        value={{
          personnel: personnelInfo,
          addExpertise: handleExpertiseAdd,
          updateExpertise: handleExpertiseUpdate,
        }}
      >
        <TrainingTable
          loading={isLoading}
          personnelInfo={personnelInfo}
          setSearch={setSearchAttribute}
          showCheckBox={searchAttribute?.expertiseId ? true : false}
        />
      </TrainingContext.Provider>
    </>
  );
}
