import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

import GetAllUsers from "@/api/users/getAllUsers";
import { EvaluatorProps } from "@/app/dashboard/form-generator/data/EvaluationFormTypes";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroups } from "@/identity/groups/services/getGroups";

interface FindUserProps {
  user: EvaluatorProps | undefined;
  setUser: (data: EvaluatorProps | undefined) => void;
}

export default function FindUser({ user, setUser }: FindUserProps) {
  const [users, setUsers] = useState<Array<any> | undefined>();
  const [searchedName, setSearchedName] = useState<string>();

  async function getUser() {
    let res;
    try {
      let group = getGroups(UserGroupType.Group, {
        filters: [{ name: "name", value: "surveyors" }],
      });
      group.then((response) => {
        if (response) {
          res = GetAllUsers({
            page: 0,
            size: 999,
            searchByName: searchedName,
            groupName: response[0].id,
          });
          res.then((res) => {
            setUsers(res.result?.data);
          });
        }
      });
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchedName && searchedName?.length > 3) {
        getUser();
      } else {
        setUsers(undefined);
      }
    }, 300);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [searchedName]);

  return (
    <div className="flex flex-col relative mb-5">
      <label className=" mt-[.5rem] mx-[1.5rem] select-none">بازرس</label>
      <input
        className={` mx-[1rem] text-[.9rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0`}
        type="text"
        placeholder="جستجو"
        onChange={(event) =>
          setSearchedName(
            event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ")
          )
        }
        value={
          user
            ? `${user.name} ${user.lastname}`
            : searchedName
            ? searchedName
            : ""
        }
        disabled={user ? true : false}
      />
      {!user && users?.length ? (
        <div className="bg-gray-200 w-[223px] rounded absolute top-[5.5rem] right-[1rem] mb-[10rem] max-h-[288px] overflow-y-scroll z-10">
          {users?.map((user, index) => (
            <p
              key={index}
              onClick={() => {
                setUser(user);
                setUsers(undefined);
              }}
              className="pr-3 py-2 hover:bg-blue-400 hover:text-white cursor-pointer rounded">
              {user.name} {user.lastname}
            </p>
          ))}
        </div>
      ) : (
        searchedName &&
        !user && <span className="text-red-600 mr-[1rem]">موردی یافت نشد!</span>
      )}
      {user && (
        <span className="bg-gray-200 p-2 w-fit rounded-2xl m-1 mr-[1rem]">
          {user?.name} {user?.lastname}
          <RxCross2
            data-tooltip-id="filterCleaner"
            size={15}
            className="inline-flex mr-2 cursor-pointer hover:text-red-500"
            onClick={() => {
              setUser(undefined);
              setSearchedName(undefined);
            }}
          />
        </span>
      )}
    </div>
  );
}
