import { memo } from "react";
import { useFormContext } from "react-hook-form";

import { Loading } from "@/ui/Loader";
import SignaturePad from "@/ui/SignaturePad";

import { FormData } from "./ProfileDocuments";

export const DocumentSignature = memo(function DocumentSignature({
  loading,
  onUpload,
}: {
  loading: boolean;
  onUpload: ({ v }: { v: File }) => void;
}) {
  const { watch } = useFormContext<FormData>();
  const fieldValue = watch("signature");

  return (
    <div className="flex flex-col gap-y-2 col-span-full xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3">
      <div className="flex w-full gap-x-2">
        <label className="shrink-0" htmlFor="signature">
          امضا:
        </label>
        {loading && <Loading size="xs" />}
      </div>
      <div>
        <div>
          <SignaturePad
            disabled={loading}
            setSignature={async (v) => {
              const blob = dataURLtoBlob(v);
              const file = new File([blob], "signature.png", {
                type: blob.type,
              });

              await onUpload({
                v: file,
              });
            }}
            signature={fieldValue ? URL.createObjectURL(fieldValue) : undefined}
            // clearSignature={async () => {
            //   await removeFile("signature")}
            // }
          />
        </div>
      </div>
    </div>
  );
});

function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
