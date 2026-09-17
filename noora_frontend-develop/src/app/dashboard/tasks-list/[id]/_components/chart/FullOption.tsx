import React, { useState } from "react";
import {
  PieChart,
  pieChartDefaultProps,
  PieChartProps,
} from "react-minimal-pie-chart";

function FullOption(props: PieChartProps) {
  const [selected, setSelected] = useState<number | undefined>(0);
  const [hovered, setHovered] = useState<number | undefined>(undefined);

  const data = props.data.map((entry, i) => {
    if (hovered === i) {
      return {
        ...entry,
        color: "grey",
      };
    }
    return entry;
  });

  const lineWidth = 60;

  return (
    <div className="flex my-2">
      <PieChart
        className="max-w-[15rem] select-none"
        style={{
          fontSize: "8px",
        }}
        data={data}
        radius={pieChartDefaultProps.radius - 6}
        lineWidth={60}
        segmentsStyle={{ transition: "stroke .5s" }}
        segmentsShift={(index) => 2}
        animate
        label={({ dataEntry }) =>
          dataEntry.percentage !== 0 && Math.round(dataEntry.percentage) + "%"
        }
        labelPosition={100 - lineWidth / 2}
        labelStyle={{
          fill: "#fff",
          opacity: 0.9,
          pointerEvents: "none",
        }}
        onClick={(_, index) => {
          setSelected(index === selected ? undefined : index);
        }}
      />
      <div className="self-end select-none">
        {data?.map((item, index) => (
          <div
            key={index}
            className="flex items-center cursor-pointer"
            onClick={() => {
              hovered === undefined ? setHovered(index) : setHovered(undefined);
            }}>
            <div
              className={`mx-1 my-2 h-3 w-3 rounded-sm`}
              style={{ backgroundColor: item?.color }}></div>
            <p>{item?.title ?? "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FullOption;
