"use client";

import { memo } from "react";

import { FilesWidget } from "@/felo/files/components/files-widget/FilesWidget";

import { useInspectionContext } from "../context/InspectionContext";

export const InspectionDocuments = memo(function InspectionDocuments() {
  const {
    instance: { id },
  } = useInspectionContext();

  return <FilesWidget instanceId={id} />;
});
