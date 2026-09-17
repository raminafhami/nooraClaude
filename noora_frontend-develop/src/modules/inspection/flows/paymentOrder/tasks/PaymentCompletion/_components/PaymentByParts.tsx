import React from "react";
import { IoIosRemoveCircle } from "react-icons/io";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies } from "@/inspection/models/Currencies";

interface Props {
  inputs: any;
  setInputs: (item: any) => void;
  disabled?: boolean;
  onlyPrice?: boolean;
  rate: string;
  currency: string;
}

const PaymentByParts = ({
  inputs,
  setInputs,
  disabled,
  onlyPrice,
  rate,
  currency,
}: Props) => {
  const handleChange = (index: any, field: any, value: any) => {
    // Remove commas from the input value
    const numericValue = (value || "").toString().replace(/,/g, ""); // This removes any commas from the value

    const newInputs = [...inputs];
    newInputs[index][field] = numericValue; // Update state with the value without commas
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
        <div key={index} className="flex flex-wrap items-center relative my-2">
          <div className="flex flex-col">
            <Label className="mx-[1rem] mb-[.5rem]">مبلغ</Label>
            <Input
              disabled={disabled}
              onChange={(event) => {
                handleChange(index, "value", event.target.value);

                handleChange(index, "rate", rate); //static

                handleChange(index, "currency", currency); //static
              }}
              value={input.value
                ?.replace(/[^\d]/g, "")
                ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              className="mx-[1rem] w-[300px] text-[.9rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
              placeholder="000,000,000"
            />
          </div>
          <div className="flex flex-col w-[300px] m-2">
            <Label className="m-1">واحد پول</Label>
            <Select
              onValueChange={(value) => handleChange(index, "currency", value)}
              value={
                currency ? currency : input.currency ? input.currency : "rial"
              }
              disabled={disabled || onlyPrice}>
              <SelectTrigger
                className={`text-[.9rem] pl-[2.8rem] pr-[1rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0`}>
                <SelectValue placeholder="انتخاب" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem value={currency.value} key={currency.value}>
                    <span className="px-2">{currency.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label className="mx-[1rem] mb-[.5rem]">نرخ ارز</Label>
            <Input
              disabled={disabled || onlyPrice}
              onChange={(event) =>
                handleChange(index, "rate", event.target.value)
              }
              value={
                rate
                  ? rate
                      ?.replace(/[^\d]/g, "")
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : input.rate
                  ? input.rate
                      ?.replace(/[^\d]/g, "")
                      ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "1"
              }
              className="mx-[1rem] w-[300px] text-[.9rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
              placeholder="نرخ ارز"
            />
          </div>

          {/* {currency !== "rial" && (
            <div className="flex flex-col m-2">
              <Badge>
                {(input?.value * +rate)
                  ?.toString()
                  ?.replace(/[^\d]/g, "")
                  ?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                {`${
                  currency === "dollar"
                    ? "دلار"
                    : currency === "euro"
                    ? "یورو"
                    : currency === "rial"
                    ? "ریال"
                    : "یوان"
                }`}
              </Badge>
            </div>
          )} */}

          <div className="flex flex-col w-[300px] m-2">
            <Checkbox
              onCheckedChange={(value) =>
                handleChange(index, "isDocument", value)
              }
              checked={input.isDocument}
            />
          </div>

          <button
            type="button"
            onClick={() => !disabled && handleRemoveInput(index)}
            className="absolute right-1 top-9">
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

export default PaymentByParts;
