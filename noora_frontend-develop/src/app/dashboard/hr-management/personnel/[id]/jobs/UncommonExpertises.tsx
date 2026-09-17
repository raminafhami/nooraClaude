import { useContext, useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaCheck } from "react-icons/fa";
import { GiSandsOfTime } from "react-icons/gi";

import { PersonnelContext } from "../_components/PersonnelContext";
import { CertificateForm } from "./CertificateForm";
import { ExpertisesProp } from "./Expertises";
import { ExpertiseAndStatus, JobsContext } from "./JobsContext";

interface Expertises {
  title: string;
  type: string;
  id: string;
}
interface UnommonExpertises {
  expertises: Expertises[];
  jobId: string;
}
export function UnommonExpertises({ expertises, jobId }: UnommonExpertises) {
  const { expertisesStatus, setExpertisesStatus } = useContext(JobsContext);
  const { personnel } = useContext(PersonnelContext);
  useEffect(() => {
    if (expertises.length) {
      return setExpertisesStatus(
        expertises.map((expertise) => ({
          expertiseId: expertise.id,
          userId: personnel.userId,
          status: null,
          title: "",
        })) as ExpertiseAndStatus[]
      );
    } else {
      setExpertisesStatus([
        {
          expertiseId: "",
          userId: "",
          status: undefined,
        } as ExpertiseAndStatus,
      ]);
    }
  }, [jobId]);

  const groupedExpertises =
    jobId &&
    expertises?.reduce(
      (groups: { [key: string]: ExpertisesProp[] }, expertise) => {
        const { type } = expertise;
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(expertise);
        return groups;
      },
      {}
    );

  const handleStatusClick = (
    expertise: ExpertisesProp,
    status: "qualified" | "learning" | "unqualified" | null
  ) => {
    setExpertisesStatus((prevStatus) => {
      const index = prevStatus.findIndex(
        (exp) => exp.expertiseId === expertise.id
      );
      if (index !== -1) {
        // Update the status of the expertise
        const updatedStatus = [...prevStatus];
        updatedStatus[index].status = status;

        if (expertise.type === "certificate" && status === "qualified") {
          updatedStatus[index] = {
            ...updatedStatus[index],
            expertiseId: expertise.id,
            file: undefined,
            userId: personnel.userId,
            status,
            certificateDate: "",
            organizationName: "",
            title: expertise.title,
          };
        } else {
          // Remove properties if status is not qualified
          delete updatedStatus[index].organizationName;
          delete updatedStatus[index].file;
          delete updatedStatus[index].certificateDate;
          delete updatedStatus[index].title;
        }

        return updatedStatus;
      }

      return prevStatus;
    });
  };

  return (
    <div>
      {groupedExpertises &&
        Object.entries(groupedExpertises).map(([type, expertises]) => (
          <div key={type} className={`${jobId && "bg-gray-50"}`}>
            <div className="bg-gray-200 mt-2 font-bold text-primaryBlue py-1 w-32 rounded-2xl rounded-r-none text-right pr-5">
              {(() => {
                switch (type) {
                  case "certificate":
                    return "آموزش";
                  case "skill":
                    return "مهارت";
                  case "knowledge":
                    return "دانش فنی";
                  default:
                    return "";
                }
              })()}
            </div>
            {expertises.map((expertise: ExpertisesProp) => (
              <div key={expertise.id} className="flex flex-col border-b">
                <div className="flex justify-between">
                  <div className="w-full text-xs md:text-sm text-right px-5 py-3 whitespace-normal">
                    {expertise.title}
                  </div>
                  <div className="flex gap-2 pr-8 pl-5 py-3">
                    <FaCheck
                      className={`${
                        expertisesStatus?.find(
                          (exp) =>
                            exp.expertiseId === expertise.id &&
                            exp.status === "qualified"
                        )
                          ? "bg-green-500"
                          : "bg-gray-300"
                      } w-6 h-6 md:w-7 md:h-7 p-1 rounded-lg text-white cursor-pointer`}
                      onClick={() => {
                        handleStatusClick(expertise, "qualified");
                      }}
                    />
                    <GiSandsOfTime
                      className={`${
                        expertisesStatus?.find(
                          (exp) =>
                            exp.expertiseId === expertise.id &&
                            exp.status === "learning"
                        )
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      } w-6 h-6 md:w-7 md:h-7 p-1 rounded-lg text-white font-bold cursor-pointer`}
                      onClick={() => {
                        handleStatusClick(expertise, "learning");
                      }}
                    />
                    <CgClose
                      className={`${
                        expertisesStatus?.find(
                          (exp) =>
                            exp.expertiseId === expertise.id &&
                            exp.status === "unqualified"
                        )
                          ? "bg-red-500"
                          : "bg-gray-300"
                      } w-6 h-6 md:w-7 md:h-7 p-1 rounded-lg cursor-pointer text-lg text-white`}
                      onClick={() => {
                        handleStatusClick(expertise, "unqualified");
                      }}
                    />
                  </div>
                </div>
                {expertise.type === "certificate" &&
                  expertisesStatus?.find(
                    (exp) =>
                      exp.expertiseId === expertise.id &&
                      exp.status === "qualified"
                  ) && <CertificateForm expertiseId={expertise.id} />}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
