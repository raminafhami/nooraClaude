"use client";
import React, { useCallback, useState } from "react";

import { PersonnelRequestStatusType } from "@/hrm/personnelRequests/models/personnelRequestStatusType";
import { PersonnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { PersonnelRequest } from "@/hrm/personnelRequests/services/getPersonnelRequests";

import RequestsFilter from "./RequestsFilter";
import RequestsTable from "./RequestsTable";

function Requests() {
  const [requests, setRequests] = useState<PersonnelRequest[]>([]);

  const handleRequestsFetch = useCallback(
    (requests: PersonnelRequest[]): void => {
      setRequests(
        sortRequests(
          requests.filter((request: PersonnelRequest) => {
            if (request.type === PersonnelRequestType.extra) {
              return request.description;
            }
            return true;
          })
        )
      );
    },
    []
  );

  const handleRequestAction = useCallback(
    (
      request: PersonnelRequest,
      status:
        | PersonnelRequestStatusType.counted
        | PersonnelRequestStatusType.rejected
    ): void => {
      const updatedValue: PersonnelRequest = {
        ...request,
        status,
      };
      setRequests((prev) =>
        prev.map((i: PersonnelRequest) =>
          i.id !== request.id ? i : updatedValue
        )
      );
    },
    []
  );

  const sortRequests = (requests: PersonnelRequest[]): PersonnelRequest[] => {
    // const pendingForSubstitute = requests.filter(
    //   (request) => request.status === "pendingForSubstitute"
    // );
    // const pendingForManager = requests.filter(
    //   (request) => request.status === "pendingForManager"
    // );
    const waitingForConfirmation = requests.filter(
      (request) => request.status === "waitingConfirmation"
    );
    const approved = requests.filter((request) => request.status === "counted");
    const rejected = requests.filter(
      (request) => request.status === "rejected"
    );
    return [
      // ...pendingForManager,
      // ...pendingForSubstitute,
      ...waitingForConfirmation,
      ...approved,
      ...rejected,
    ];
  };
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(false);
  return (
    <div className="flex flex-col gap-y-4">
      <RequestsFilter
        setError={setError}
        setTableLoading={setTableLoading}
        onFilterSubmit={handleRequestsFetch}
      />
      <RequestsTable
        setError={setError}
        error={error}
        tableLoading={tableLoading}
        setTableLoading={setTableLoading}
        onRequestsFetch={handleRequestsFetch}
        requests={requests}
        onSubstituteRequestAction={handleRequestAction}
      />
    </div>
  );
}

export default Requests;
