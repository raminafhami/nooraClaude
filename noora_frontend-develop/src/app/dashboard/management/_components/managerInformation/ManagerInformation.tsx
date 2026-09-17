import PersonnelLeaveRequests from "./PersonnelLeaveRequests";
import PersonnelStatus from "./PersonnelStatus";

export default function ManagerInformation() {
  return (
    <div className="lg:flex gap-6 flex-wrap">
      <PersonnelStatus />
      <PersonnelLeaveRequests />
    </div>
  );
}
