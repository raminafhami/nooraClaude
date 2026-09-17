import { memo } from "react";
import { useFormContext } from "react-hook-form";

import FileInput from "@/ui/FileInput";
import { Loading } from "@/ui/Loader";

import { DocumentSkeleton } from "./DocumentSkeleton";
import { FormData } from "./ProfileDocuments";

export const DocumentItem = memo(function DocumentItem({
  loading,
  itemKey,
  title,
  onUpload,
}: {
  loading: boolean;
  itemKey: keyof FormData;
  title: string;
  onUpload: ({
    title,
    key,
    v,
  }: {
    title: string;
    key: keyof FormData;
    v: File;
  }) => void;
}) {
  const { watch } = useFormContext<FormData>();
  const fieldValue = watch(itemKey);

  return (
    <div className="flex flex-col gap-y-2 col-span-full xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
      <div className="flex w-full gap-x-2">
        <label className="shrink-0" htmlFor={itemKey}>
          {title}:
        </label>
        {loading && <Loading size="xs" />}
      </div>
      {loading ? (
        <DocumentSkeleton />
      ) : (
        <div>
          <FileInput
            loading={loading}
            setFile={async (v) => {
              await onUpload({
                title,
                key: itemKey,
                v: v as File,
              });
            }}
            file={fieldValue}
          />
        </div>
      )}
    </div>
  );
});
