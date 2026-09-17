import React from "react";
import { FaPlus } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";

interface Props {
  inputs: any;
  setInputs: (item: any) => void;
  mode?: "kanban" | "custom";
}

const ColumnsManager = ({ inputs, setInputs, mode }: Props) => {
  const handleAddInput = () => {
    const newInputs = [...inputs];
    setInputs([...inputs, { name: "", order: newInputs?.length }]);
  };
  const handleChange = (index: any, field: any, value: any) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    newInputs[newInputs?.length - 1]["order"] = newInputs?.length;
    setInputs(newInputs);
  };

  const handleRemoveInput = (index: any) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  return (
    <div className="flex flex-col">
      <div>
        <label className="my-[.5rem] mx-[1.5rem] select-none flex items-center">
          وضعیت ها
          <button type="button" onClick={handleAddInput}>
            <FaPlus
              size={16}
              className="text-blue-500 hover:text-blue-600 mr-2"
            />
          </button>
        </label>
      </div>
      {inputs?.map((input: any, index: any) => (
        <div key={index} className="flex flex-wrap items-center relative">
          <input
            onChange={(event) =>
              handleChange(index, "name", event.target.value)
            }
            value={input.name}
            className="mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
            placeholder={
              mode === "kanban" && index === inputs?.length - 1
                ? "نام آخرین وضعیت"
                : "نام"
            }
          />
          <input
            disabled
            type="number"
            onChange={(event) =>
              handleChange(index, "order", +event.target.value)
            }
            value={index + 1}
            className="mx-[1rem] hidden w-[300px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
            placeholder="ترتیب"
          />
          <button
            type="button"
            onClick={() => {
              handleRemoveInput(index);
            }}
            className={`absolute ${
              mode === "kanban" &&
              (index === 0 || index === inputs?.length - 1) &&
              "hidden"
            } right-1 top-2`}>
            <IoIosRemoveCircle
              size={20}
              className="text-red-500 hover:text-red-600 ml-2"
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ColumnsManager;
