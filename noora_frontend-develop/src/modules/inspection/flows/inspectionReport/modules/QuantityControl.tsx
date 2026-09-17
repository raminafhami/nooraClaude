import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";

interface Props {
  inputs: any;
  setInputs: (item: any) => void;
}

const QuantityControl = ({ inputs, setInputs }: Props) => {
  const handleChange = (index: any, field: any, value: any) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const handleRemoveInput = (index: any) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  return (
    <div className="flex flex-wrap items-center">
      {inputs?.map((input: any, index: any) => (
        <div key={index} className="flex flex-wrap items-center relative">
          <input
            onChange={(event) =>
              handleChange(index, "name", event.target.value)
            }
            value={input.name}
            className="mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
            placeholder="کالا"
          />
          مقدار
          <input
            onChange={(event) =>
              handleChange(index, "from", event.target.value)
            }
            value={input.from}
            className="mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
            placeholder=""
          />
          از
          <input
            onChange={(event) => handleChange(index, "to", event.target.value)}
            value={input.to}
            className="mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
            placeholder=""
          />
          <button
            type="button"
            onClick={() => handleRemoveInput(index)}
            className="absolute right-1 top-2">
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

export default QuantityControl;
