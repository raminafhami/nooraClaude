import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

import GetAllUsers from "@/api/users/getAllUsers";

import { EvaluatorProps } from "../../data/EvaluationFormTypes";

interface FormEvaluatorProps {
  evaluater: EvaluatorProps | undefined;
  setEvaluater: (data: EvaluatorProps | undefined) => void;
}

export default function FormEvaluator({
  evaluater,
  setEvaluater,
}: FormEvaluatorProps) {
  const [users, setUsers] = useState<Array<any> | undefined>();
  const [searchedName, setSearchedName] = useState<string>();

  async function getEvaluater() {
    let res;
    try {
      res = GetAllUsers({
        page: 0,
        size: 999,
        searchByName: searchedName,
      });
      res.then((res) => {
        setUsers(res.result?.data);
      });
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchedName && searchedName?.length > 3) {
        getEvaluater();
      } else {
        setUsers(undefined);
      }
    }, 300);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [searchedName]);

  return (
    <div className="flex flex-col mb-10 relative">
      <input
        className="ml-20 mb-2 rounded-xl border-white"
        type="text"
        placeholder="ارزیاب"
        onChange={(event) =>
          setSearchedName(
            event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ")
          )
        }
        value={
          evaluater
            ? `${evaluater.name} ${evaluater.lastname}`
            : searchedName
            ? searchedName
            : ""
        }
        disabled={evaluater ? true : false}
      />
      {!evaluater && users?.length ? (
        <div className="bg-gray-200 w-[223px] rounded absolute top-[3rem] mb-[10rem] max-h-[288px] overflow-y-scroll z-10">
          {users?.map((user, index) => (
            <p
              key={index}
              onClick={() => {
                setEvaluater(user);
                setUsers(undefined);
              }}
              className="pr-3 py-2 hover:bg-blue-400 hover:text-white cursor-pointer rounded">
              {user.name} {user.lastname}
            </p>
          ))}
        </div>
      ) : (
        searchedName &&
        !evaluater && <span className="text-red-600">موردی یافت نشد!</span>
      )}
      {evaluater && (
        <span className="bg-gray-200 p-2 w-fit rounded-2xl m-1">
          {evaluater?.name} {evaluater?.lastname}
          <RxCross2
            data-tooltip-id="filterCleaner"
            size={15}
            className="inline-flex mr-2 cursor-pointer hover:text-red-500"
            onClick={() => {
              setEvaluater(undefined);
              setSearchedName(undefined);
            }}
          />
        </span>
      )}
    </div>
  );
}
