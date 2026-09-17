import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import PostProjectsTasksLabel from "@/api/tasks-manager/postProjectsTasksLabel";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AddProjectLabelProps {
  setIds: (ids: string[]) => void;
  labels?: any;
}

type Label = {
  branchId: null;
  name: string;
  lastname: string;
  username: string;
  nationalCode: string;
  email: string;
  phoneNo: string;
  type: string;
  groups: string[];
  id: string;
  title: string;
};

type Data = Label[];

export default function AddProjectLabel({
  setIds,
  labels,
}: AddProjectLabelProps) {
  const [searchedName, setSearchedName] = useState<string>();
  const [dropDownData, setDropDownData] = useState<Data>();
  const [assignTo, setAssignTo] = useState<Data>(labels);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>();
  async function getProjectLabel() {
    let res;
    let searchByNameIs = searchedName ? searchedName : undefined;

    try {
      res = GetAllProjectsTasksLabels({
        page: 0,
        size: 9999,
        searchByName: searchByNameIs,
      });
      res.then((res) => {
        setDropDownData(res.result?.data);
      });
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }

  async function postNewLabel(title: string) {
    let res;
    try {
      res = PostProjectsTasksLabel({
        title,
      });
      res.then((res) => {
        getProjectLabel();
        groupSelector(res.result);

        setSearchedName(undefined);
      });
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }

  function groupSelector(user: Label) {
    if (!assignTo?.some((existingUser) => existingUser.id === user.id)) {
      setAssignTo((prev) => [...(prev || []), user]);
    }
  }
  function removeFromAssignTo(user: string) {
    setAssignTo((prev) =>
      prev.filter((existingUser) => existingUser.id !== user)
    );
  }

  useEffect(() => {
    const delayDebounceFn2 = setTimeout(() => {
      getProjectLabel();
    }, 300);
    return () => {
      clearTimeout(delayDebounceFn2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedName]);

  useEffect(() => {
    setIds(assignTo?.map((item) => String(item.id)));
    setValue(assignTo?.map((item) => String(item.id)));
  }, [assignTo, setIds]);

  useEffect(() => {
    getProjectLabel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col relative ">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className=" justify-between text-[.9rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0">
            جستجو
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px]">
          <Command>
            <input
              className="w-[280px] mx-2 text-[.9rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis border-gray-300 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
              type="text"
              placeholder="جستجو"
              onChange={(event) =>
                setSearchedName(
                  event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
                )
              }
              value={searchedName ? searchedName : ""}
            />
            <CommandEmpty>برچسبی یافت نشد...</CommandEmpty>
            <CommandGroup className="max-h-[20rem] overflow-y-auto">
              {dropDownData?.map((user, index) => (
                <CommandItem
                  key={index}
                  value={`${user.title}`}
                  onSelect={(currentValue) => {
                    !value?.includes(user.id)
                      ? groupSelector(user)
                      : removeFromAssignTo(user.id);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.includes(user.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {user.title}
                </CommandItem>
              ))}
              {dropDownData?.length === 0 && searchedName && (
                <CommandItem
                  value={`${searchedName}`}
                  onSelect={(currentValue) => {
                    postNewLabel(searchedName);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.includes(searchedName)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  ایجاد {searchedName} به عنوان برچسب جدید
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {assignTo?.length ? (
        <div className="h-full mt-4 flex flex-wrap">
          {assignTo?.map((user, index) => (
            <span
              key={index}
              className="bg-gray-200 p-2 w-fit rounded-2xl m-1 mr-[.5rem]">
              {user?.title}
              <RxCross2
                data-tooltip-id="filterCleaner"
                size={15}
                className="inline-flex mr-2 cursor-pointer hover:text-red-500"
                onClick={() => {
                  removeFromAssignTo(user.id);
                }}
              />
            </span>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
