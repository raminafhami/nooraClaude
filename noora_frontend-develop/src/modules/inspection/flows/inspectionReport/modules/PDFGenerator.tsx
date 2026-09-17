import React from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { Margin, usePDF } from "react-to-pdf";

interface Props {
  dynamicContent: React.ReactNode; // Dynamic content to be displayed in the PDF
  fileName: string;
  caseNo: string | number;
  button?: string;
}

const PDFGenerator: React.FC<Props> = ({
  dynamicContent,
  fileName,
  caseNo,
  button,
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate
    .toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/[/ :]/g, "-");

  const { toPDF, targetRef } = usePDF({
    filename: `NAIT${fileName ? `-${fileName}` : ""}-${
      caseNo ? `${caseNo}-` : ""
    }${formattedDate}.pdf`,
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className="w-full xl:max-w-[1000px] break-inside-avoid"
        ref={targetRef}>
        <div className="p-10">{dynamicContent}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          toPDF({ method: "open", page: { margin: Margin.MEDIUM } });
        }}
        className=" bg-white rounded-2xl p-3 w-fit border-gray-200 hover:bg-blue-400 hover:text-white border-2 my-4 cursor-pointer">
        <FaRegFilePdf className="inline ml-1 text-red-500" size={20} />
        <span>{button ? button : "دانلود PDF"}</span>
      </button>
    </div>
  );
};

export default PDFGenerator;
