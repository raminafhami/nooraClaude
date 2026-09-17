import { useFormContext } from "react-hook-form";

import { TinyEditor } from "@/form/editor/TinyEditor";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { ids } from "../../data";

interface Props {
  date?: any;
  no: string;
  isFile: string;
}
export function Template({ date, no, isFile }: Props) {
  const { setValue, watch } = useFormContext();
  const fields = watch();

  return (
    <>
      <div
        style={{
          width: "21cm",
          height: "29.7cm",
          fontFamily: "var(--font-family-vazirmatn)",
        }}
      >
        <div className="relative flex h-full px-32 pt-28 pb-48 rounded-xl bg-white text-[15px] flex-col">
          <div className="text-center font-bold">به نام خدا</div>

          <div className="flex my-8 justify-end">
            <div className="font-bold">
              <div>تاریخ: {(date && toFarsiNum(date)) ?? "-"}</div>
              <div>شماره نامه: {no && toFarsiNum(no)}</div>
              <div>
                پیوست:{" "}
                {isFile === "true"
                  ? "دارد"
                  : isFile === "false"
                  ? "ندارد"
                  : "-"}
              </div>
            </div>
          </div>

          {(fields[ids.letterToName] ||
            fields[ids.letterToPosition] ||
            fields[ids.letterSubject]) && (
            <div className="font-bold space-y-0.5 mb-8">
              {fields[ids.letterToName] && (
                <div>{fields[ids.letterToName]}</div>
              )}
              {fields[ids.letterToPosition] && (
                <div>{fields[ids.letterToPosition]}</div>
              )}
              {fields[ids.letterSubject] && (
                <div>موضوع: {fields[ids.letterSubject]}</div>
              )}
            </div>
          )}

          <div className="font-bold">با سلام و احترام</div>
          <div
            className={`mt-2 text-justify overflow-hidden ${
              !fields[ids.letterBody] && "bg-gray-100"
            } focus-within:bg-transparent cursor-text transition-all rounded-xl p-2`}
          >
            <TinyEditor
              id={ids.letterBody}
              inline
              init={{ height: "100%" }}
              value={fields[ids.letterBody]}
              onMutate={(value) =>
                setValue(ids.letterBody, value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />
          </div>

          <div>رونوشت:</div>
          <div
            className={`ms-2 w-full ${
              !fields[ids.letterTranscriptions] && "bg-gray-100"
            } focus-within:bg-transparent cursor-text transition-all rounded-xl p-2`}
          >
            <TinyEditor
              id={`letterTranscriptions`}
              inline
              init={{ height: "100%" }}
              value={fields[ids.letterTranscriptions]}
              onMutate={(value) =>
                setValue(ids.letterTranscriptions, value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />
          </div>

          <div className="flex mt-8 me-8 justify-end shrink-0">
            <div className="text-center font-bold">
              <div>با تشکر</div>
              <div>مدیرعامل</div>
              <div>جواد مرادی</div>
            </div>
          </div>
          {/* 
          <div className="absolute end-0 top-1/2 text-gray-500 font-bold -rotate-90">
            تهیه شده توسط اتوماسیون
          </div> */}
        </div>
      </div>
    </>
  );
}
