"use client";
import React, { useCallback, useEffect, useState } from "react";

import {
  getMyRequests,
  MyRequests,
} from "@/hrm/personnelRequests/services/getMyRequests";

import ProfileAttendanceRequestsForm from "./ProfileAttendanceRequestsForm";
import ProfileAttendanceRequestTable from "./ProfileAttendanceRequestTable";

// import ProfileAttendanceRequestSubstituteTable from "./ProfileAttendanceRequestSubstituteTable";
// import { substituteRequestModel } from "@/hrm/personnelRequests/models/substituteRequestModel";

function ProfileAttendanceRequests() {
  const [requests, setRequests] = useState<MyRequests[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function loadRequests() {
    try {
      setLoading(true);
      const responses = await getMyRequests();
      setRequests(responses);
    } catch (err: any) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const fetchRequests = useCallback(async (): Promise<void> => {
    await loadRequests();
  }, []);

  useEffect(() => {
    loadRequests();
  }, []);

  // const [substituterequests, setSubstituteRequests] = useState<
  //   substituteRequestModel[]
  // >([]);

  // const handleSubstituteRequestsFetch = useCallback(
  //   (requests: substituteRequestModel[]): void => {
  //     setSubstituteRequests(requests);
  //   },
  //   []
  // );
  // const handleSubstituteRequestAction = useCallback(
  //   (requests: substituteRequestModel[]) => {
  //     setSubstituteRequests(requests);
  //   },
  //   []
  // );

  return (
    <>
      <div className="grid grid-cols-1">
        <div className="col-span-full">
          <div className="font-semibold grid basis-56">افزودن درخواست جدید</div>
          <div className="flex items-start justify-between h-full overflow-x-visible">
            <ProfileAttendanceRequestsForm
              setLoading={setLoading}
              onRequestAdd={fetchRequests}
              requests={requests}
            />
          </div>
        </div>

        <div className="col-span-full space-y-6">
          <div className="font-semibold grid basis-56">درخواست‌های من</div>
          <ProfileAttendanceRequestTable
            loading={loading}
            requests={requests}
            onRequestsAction={fetchRequests}
            error={error}
          />
        </div>
      </div>
      {/* <div className=" flex flex-col gap-3 ">
        <div>
          <div className="font-semibold grid basis-56">
            درخواست‌های جانشینی همکاران
          </div>
        </div>

        <ProfileAttendanceRequestSubstituteTable
          requests={substituterequests}
          onRequestsFetch={handleSubstituteRequestsFetch}
          onSubstituteRequestAction={handleSubstituteRequestAction}
        />
      </div> */}
    </>
  );
}

export default ProfileAttendanceRequests;
