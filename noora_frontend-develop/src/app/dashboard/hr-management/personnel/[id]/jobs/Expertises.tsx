import React, { useContext, useEffect, useState } from "react";

import { GroupedExpertisesApi } from "@/hrm/personnel/models/GroupedExpertisesApi";
import { getGroupedExpertises } from "@/hrm/personnel/services/getGroupedExpertises";

import { PersonnelContext } from "../_components/PersonnelContext";
import { CommonExpertises } from "./CommonExpertises";
import { UnommonExpertises } from "./UncommonExpertises";

interface GroupedExpertises {
  jobId: string | undefined;
}
export interface ExpertisesProp {
  id: string;
  title: string;
  type: string;
}
export function Expertises({ jobId }: GroupedExpertises) {
  const [loading, setLoading] = useState<boolean>(true);
  const [expertises, setExpertises] = useState<GroupedExpertisesApi>();
  const { personnel } = useContext(PersonnelContext);
  async function getExpertises() {
    setLoading(true);
    if (jobId)
      setExpertises(await getGroupedExpertises(personnel.userId, jobId));
    setLoading(false);
  }

  useEffect(() => {
    if (jobId) {
      getExpertises();
    }
  }, [jobId]);

  return (
    <div className={`md:w-2/3`}>
      <div className="p-5 pl-10 bg-gray-200 text-left min-w-full rounded-xl md:rounded-l-xl">
        وضعیت
      </div>

      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full scrollbar-h-fit right-0 max-h-[550px]">
        {!jobId ? (
          <div className="text-center py-12 md:pt-52">
            یک سمت شغلی را انتخاب کنید
          </div>
        ) : loading ? (
          <div className="text-center py-12 md:pt-52 bg-white">
            درحال دریافت اطلاعات...
          </div>
        ) : expertises ? (
          <>
            <UnommonExpertises expertises={expertises.unCommon} jobId={jobId} />
            {expertises.common?.length > 0 && (
              <CommonExpertises expertises={expertises.common} jobId={jobId} />
            )}
          </>
        ) : (
          <div className="text-center pt-52 bg-white">
            هیچ اطلاعاتی یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}
