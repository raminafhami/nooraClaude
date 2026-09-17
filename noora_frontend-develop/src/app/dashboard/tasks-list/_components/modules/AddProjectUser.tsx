import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import GetAllUsers from "@/api/users/getAllUsers";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface AddProjectUserProps {
  setIds: (ids: string[]) => void;
  ids: any;
  users: any;
}

type Person = {
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
};

type Data = Person[];

export default function AddProjectUser({
  setIds,
  ids,
  users,
}: AddProjectUserProps) {
  const [searchedName, setSearchedName] = useState<string>();
  const [dropDownData, setDropDownData] = useState<Data>();
  const [assignTo, setAssignTo] = useState<Data>([]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>();
  const getUserGroups = useCallback(async () => {
    let res;
    let searchByNameIs = searchedName ? searchedName : undefined;

    try {
      res = GetAllUsers({
        page: 0,
        size: 9999,
        searchByName: searchByNameIs,
        type: "personnel",
      });
      res.then((res) => {
        setDropDownData(res.result?.data);
      });
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }, [searchedName]);

  function groupSelector(user: Person) {
    if (!assignTo?.some((existingUser) => existingUser.id === user.id)) {
      setAssignTo((prev) => [...prev, user]);
    }
  }
  function removeFromAssignTo(user: Person) {
    setAssignTo((prev) =>
      prev.filter((existingUser) => existingUser.id !== user.id)
    );
  }

  useEffect(() => {
    const delayDebounceFn2 = setTimeout(() => {
      getUserGroups();
    }, 300);
    return () => {
      clearTimeout(delayDebounceFn2);
    };
  }, [getUserGroups, searchedName]);

  useEffect(() => {
    setIds(assignTo.map((item) => String(item.id)));
    setValue(assignTo.map((item) => String(item.id)));
  }, [assignTo, setIds]);

  useEffect(() => {
    getUserGroups();
  }, [getUserGroups]);

  useEffect(() => {
    if (ids) {
      setValue(ids);
    }
  }, [ids]);
  useEffect(() => {
    if (users) {
      setAssignTo(users);
    }
  }, [users]);

  return (
    <div className="flex flex-col mb-10 relative mx-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-[.9rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0">
            جستجو
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full PopoverContent">
          <Command>
            <input
              className="w-full text-[.9rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis border-gray-300 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0"
              type="text"
              placeholder="جستجو"
              onChange={(event) =>
                setSearchedName(
                  event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " ")
                )
              }
              value={searchedName ? searchedName : ""}
            />
            <CommandEmpty>کاربری یافت نشد...</CommandEmpty>
            <CommandGroup className="max-h-[20rem] overflow-y-auto">
              {dropDownData?.map((user, index) => (
                <CommandItem
                  key={index}
                  value={`${user.name} ${user.lastname}`}
                  onSelect={() => {
                    value?.includes(user.id)
                      ? removeFromAssignTo(user)
                      : groupSelector(user);
                  }}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.name} {user.lastname}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {assignTo && (
        <div className="flex flex-wrap mt-6">
          {
            <Table>
              <TableCaption>کاربران اضافه شده به پروژه</TableCaption>

              <TableHeader>
                {!assignTo ? null : (
                  <TableRow className="text-right bg-gray-100 select-none">
                    <TableHead className="text-right">ردیف</TableHead>
                    <TableHead className="text-right">کاربر</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {!assignTo ? (
                  <TableRow>
                    <TableCell>کاربری یافت نشد...</TableCell>
                  </TableRow>
                ) : (
                  assignTo.map((group, index) => (
                    <>
                      <TableRow key={group.id}>
                        <TableCell>{++index}</TableCell>
                        <TableCell>
                          {group.name} {group.lastname}
                        </TableCell>
                        <TableCell>
                          <BsFillTrashFill
                            data-tooltip-id={`${group.id}`}
                            size={17}
                            className={`text-red-500 inline cursor-pointer mr-2 focus:outline-0`}
                            onClick={() => removeFromAssignTo(group)}
                          />
                        </TableCell>
                      </TableRow>
                      <Tooltip id={`${group.id}`}>حذف</Tooltip>
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          }
        </div>
      )}
    </div>
  );
}
