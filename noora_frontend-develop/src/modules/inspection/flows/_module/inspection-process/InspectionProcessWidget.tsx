import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { InspectionType } from "@/inspection/models/InspectionType";

import { InspectionProcessForm } from "./InspectionProcessForm";
import { ids } from "./InspectionProcessIds";

interface Props {
  inspectionType: InspectionType;
}

function InspectionProcessWidget({ inspectionType }: Props) {
  const { instance } = useInspectionContext();

  const {
    [ids.inspectionInstanceId]: inspectionInstanceId,
    [ids.inspectionCaseNo]: inspectionCaseNo,
  } = instance.parameters;

  if (inspectionInstanceId || inspectionCaseNo) {
    return <>شماره فایل بازرسی: {inspectionCaseNo}</>;
  }

  return <InspectionProcessForm inspectionType={inspectionType} />;
}

export { InspectionProcessWidget };
