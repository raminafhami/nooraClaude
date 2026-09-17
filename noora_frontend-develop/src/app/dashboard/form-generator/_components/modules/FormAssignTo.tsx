import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

import GetAllUserGroups from "@/api/user-groups/getAllUserGroups";

import { GroupDataProps } from "../../data/EvaluationFormTypes";

interface FormAssignToProps {
  setIds: (ids: string[]) => void;
}

export default function FormAssignTo({ setIds }: FormAssignToProps) {
  const [searchedName, setSearchedName] = useState<string>();
  const [dropDownData, setDropDownData] = useState<GroupDataProps[]>();
  const [assignTo, setAssignTo] = useState<GroupDataProps[]>([]);

  async function getUserGroups() {
    let res;
    try {
      res = GetAllUserGroups({
        page: 0,
        size: 999,
        searchByName: searchedName,
      });
      res.then((res) => {
        setDropDownData(res.result?.data);
      });
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }

  function groupSelector(user: GroupDataProps) {
    if (!assignTo?.some((existingUser) => existingUser.id === user.id)) {
      setAssignTo((prev) => [...prev, user]);
      setDropDownData(undefined);
      setSearchedName(undefined);
    }
  }
  function removeFromAssignTo(user: GroupDataProps) {
    setAssignTo((prev) =>
      prev.filter((existingUser) => existingUser.id !== user.id)
    );
  }

  useEffect(() => {
    const delayDebounceFn2 = setTimeout(() => {
      if (searchedName && searchedName?.length > 1) {
        getUserGroups();
      } else {
        setDropDownData(undefined);
      }
    }, 300);
    return () => {
      clearTimeout(delayDebounceFn2);
    };
  }, [searchedName]);

  useEffect(() => {
    setIds(assignTo.map((item) => String(item.id)));
  }, [assignTo]);

  return (
    <div className="flex flex-col mb-10 relative">
      <input
        className="ml-20 mb-2 rounded-xl border-white"
        type="text"
        placeholder="گروه هدف"
        onChange={(event) =>
          setSearchedName(
            event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ")
          )
        }
        value={searchedName ? searchedName : ""}
      />
      {dropDownData?.length ? (
        <div className="bg-gray-200 w-[223px] rounded absolute top-[3rem] mb-[10rem] max-h-[288px] overflow-y-scroll z-[1]">
          {dropDownData?.map(
            (user, index) =>
              user.type === "group" && (
                <p
                  key={index}
                  onClick={() => groupSelector(user)}
                  className="pr-3 py-2 hover:bg-blue-400 hover:text-white cursor-pointer rounded">
                  {user.type === "group" && user?.title}
                </p>
              )
          )}
        </div>
      ) : (
        searchedName && <span className="text-red-600">موردی یافت نشد!</span>
      )}
      {assignTo && (
        <div className=" max-w-[223px] flex flex-wrap">
          {assignTo.map((group, index) => (
            <span key={index} className="bg-gray-200 p-2 w-fit rounded-2xl m-1">
              {group?.title}
              <RxCross2
                data-tooltip-id="filterCleaner"
                size={15}
                className="inline-flex mr-2 cursor-pointer hover:text-red-500"
                onClick={() => {
                  removeFromAssignTo(group);
                }}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
