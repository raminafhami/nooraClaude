import { useEffect, useRef, useState } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";

import { AuditType } from "../../procedure/[id]/_components/types/auditType";
import ProcedureIdClientPage from "../../procedure/[id]/ClientPage";
import AuditPage from "../../procedure/_components/audit/page";

export default function AuditProfile() {
  const { identity } = useLoggedInUser();
  const [selectedAudit, setSelectedAudit] = useState<AuditType>();
  const procedureContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAudit && procedureContainerRef.current) {
      procedureContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedAudit]);

  return (
    <>
      <AuditPage
        readonly
        filters={{
          users: identity?.id || "",
          userGroups: identity?.groups || [""],
        }}
        selectedAudit={selectedAudit}
        setSelectedAudit={setSelectedAudit}
      />
      {selectedAudit && (
        <div
          ref={procedureContainerRef}
          className="bg-gray-50 rounded-2xl py-2 px-4 mt-4">
          <ProcedureIdClientPage auditId={selectedAudit.id} />
        </div>
      )}
    </>
  );
}
