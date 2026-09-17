import { toFarsiNum } from "@/utils/string/toFarsiNum";

interface Props {
  no: string;
  date: string;
  name: string;
  position: string;
  subject: string;
  body: string;
  transcriptions: string;
  isFile: string;
}

export function StaticTemplate(props: Partial<Props>) {
  return (
    <>
      <div
        className="page"
        style={{
          width: "21cm",
          height: "29.7cm",
          fontFamily: "'Nazanin', 'Vazirmatn'",
        }}
      >
        <div className="relative flex h-full px-32 pt-28 pb-48 rounded-xl bg-white text-[15px] flex-col">
          <div className="text-center font-bold">به نام خدا</div>

          <div className="flex my-8 justify-end">
            <div className="font-bold">
              <div>تاریخ: {props.date && toFarsiNum(props.date)}</div>
              <div>شماره نامه: {props.no && toFarsiNum(props.no)}</div>
              <div>
                پیوست:{" "}
                {props.isFile === "true"
                  ? "دارد"
                  : props.isFile === "false"
                  ? "ندارد"
                  : "-"}
              </div>
            </div>
          </div>

          {(props.name || props.position || props.subject) && (
            <div className="font-bold space-y-0.5 mb-8">
              {props.name && <div>{props.name}</div>}
              {props.position && <div>{props.position}</div>}
              {props.subject && <div>موضوع: {props.subject}</div>}
            </div>
          )}

          <div className="font-bold">با سلام و احترام</div>
          <div
            className="mt-2 text-justify overflow-hidden"
            dangerouslySetInnerHTML={{ __html: props.body ?? "" }}
          />

          {props.transcriptions && (
            <div className="flex mt-8">
              <div>رونوشت:</div>
              <div className="ms-2">
                <div
                  className="mt-2 text-justify overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: props.transcriptions ?? "",
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex mt-8 me-8 justify-end shrink-0">
            <div className="text-center font-bold">
              <div>با تشکر</div>
              <div>مدیرعامل</div>
              <div>جواد مرادی</div>
            </div>
          </div>

          <div className="absolute end-0 top-1/2 text-gray-500 font-bold -rotate-90">
            تهیه شده توسط اتوماسیون
          </div>
        </div>
      </div>
    </>
  );
}
