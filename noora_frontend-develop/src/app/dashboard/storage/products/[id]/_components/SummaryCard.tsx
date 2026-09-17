interface SummaryCardProps {
  title: string;
  subTitle: string | number;
  fontSize?: number;
  className?: any;
  isNumber?: boolean;
}

export default function SummaryCard({
  title,
  subTitle,
  fontSize,
  className,
  isNumber,
}: SummaryCardProps) {
  return (
    <>
      <div
        className={`summary-card mx-2 select-none hover:scale-105 transition-all ${
          className ? className : ""
        }`}>
        <h5
          className="text-right pt-8 pr-8 text-white text-base"
          style={fontSize ? { fontSize: `${fontSize * 1.1}rem` } : {}}>
          {`${title}:`}
        </h5>
        <p
          className={"text-left pt-8 pl-8 text-white"}
          style={fontSize ? { fontSize: `${fontSize}rem` } : {}}>
          {`${subTitle?.toLocaleString()} ${
            typeof subTitle === "number" && isNumber ? "نفر" : ""
          }`}
        </p>
      </div>
    </>
  );
}
