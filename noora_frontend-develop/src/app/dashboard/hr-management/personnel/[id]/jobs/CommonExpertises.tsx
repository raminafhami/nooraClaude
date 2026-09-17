import { CgClose } from "react-icons/cg";
import { FaCheck } from "react-icons/fa";
import { GiSandsOfTime } from "react-icons/gi";

interface Expertises {
  status: string;
  id: string;
  expertise: {
    title: string;
  };
}

interface CommonExpertises {
  expertises: Expertises[];
  jobId: string;
}
export function CommonExpertises({ expertises, jobId }: CommonExpertises) {
  return (
    <div>
      {expertises?.length > 0 && (
        <div className={`${jobId && "bg-gray-50"}`}>
          <div className="mt-2 w-52 text-right rounded-l-2xl py-1 pr-5 opacity-60 bg-gray-200">
            توانمندی‌های قبلی
          </div>
          {expertises?.map((exp) => (
            <div
              key={exp.id}
              className="flex justify-between border-b opacity-60"
            >
              <div className="w-full text-xs md:text-sm text-right px-5 py-3 whitespace-normal">
                {exp.expertise.title}
              </div>
              <div className="flex gap-2 pr-8 pl-5 py-3">
                <FaCheck
                  className={`${
                    exp.status === "qualified" ? "bg-green-500" : "bg-gray-300"
                  } w-6 h-6 md:w-7 md:h-7 p-1 rounded-lg text-white cursor-not-allowed`}
                />
                <GiSandsOfTime
                  className={`${
                    exp.status === "learning" ? "bg-yellow-500" : "bg-gray-300"
                  } w-6 h-6 md:w-7 md:h-7 p-1 rounded-lg text-white font-bold cursor-not-allowed`}
                />
                <CgClose
                  className={`${
                    exp.status === "unqualified" ? "bg-red-500" : "bg-gray-300"
                  } w-6 h-6 md:w-7 md:h-7 p-1 rounded-lg cursor-not-allowed text-lg text-white`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
