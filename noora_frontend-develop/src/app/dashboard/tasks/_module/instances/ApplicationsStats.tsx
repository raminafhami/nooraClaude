import { Application } from "./models/Application";

interface Props {
  applications: Application[];
}

export function ApplicationsStats({ applications }: Props): React.ReactNode {
  let activeApplications = 0;
  applications?.map((application) => {
    application?.instance?.status === "active" && activeApplications++;
  });
  let doneApplications = 0;
  applications?.map((application) => {
    application?.instance?.status === "completed" && doneApplications++;
  });
  return (
    <div className="flex w-full gap-x-6">
      <div
        className="relative w-1/4 h-[120px] px-5 py-5 rounded-xl bg-white text-white"
        style={{
          background: "linear-gradient(135deg, #fff 0%, #f04d42 100%)",
        }}>
        <div className="text-2xl font-extralight">در انتظار تایید</div>
        <div className="text-2xl font-extralight">0</div>
        <div className="inline-block px-4 rounded-sm bg-white bg-opacity-70 text-[10px] text-[#f04d42]">
          بیشتر
        </div>
        <div
          className="absolute w-2/3 h-10 bottom-0 end-0 bg-cover"
          style={{ backgroundImage: "url(/images/shapes/eggs.png)" }}></div>
      </div>

      <div
        className="relative w-1/4 h-[120px] px-5 py-5 rounded-xl bg-white text-white"
        style={{
          background: "linear-gradient(135deg, #fff 0%, #f37630 100%)",
        }}>
        <div className="text-2xl font-extralight">در حال اجرا</div>
        <div className="text-2xl font-extralight">{activeApplications}</div>
        <div className="inline-block px-4 rounded-sm bg-white bg-opacity-70 text-[10px] text-[#f04d42]">
          بیشتر
        </div>
        <div
          className="absolute w-1/3 h-full bottom-0 end-2 bg-contain bg-left-bottom bg-no-repeat"
          style={{
            backgroundImage: "url(/images/shapes/birds-two.png)",
          }}></div>
      </div>

      <div
        className="relative w-1/4 h-[120px] px-5 py-5 rounded-xl bg-white text-white"
        style={{
          background: "linear-gradient(135deg, #fff 0%, #1bb383 100%)",
        }}>
        <div className="text-2xl font-extralight">اتمام فرآیند</div>
        <div className="text-2xl font-extralight">{doneApplications}</div>
        <div className="inline-block px-4 rounded-sm bg-white bg-opacity-70 text-[10px] text-[#1bb383]">
          بیشتر
        </div>
        <div
          className="absolute w-2/3 h-full bottom-4 end-2 bg-contain bg-no-repeat"
          style={{
            backgroundImage: "url(/images/shapes/bird-flyin.png)",
          }}></div>
      </div>
    </div>
  );
}
