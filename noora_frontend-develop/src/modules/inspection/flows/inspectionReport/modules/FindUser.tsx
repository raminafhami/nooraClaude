import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import GetAllUsers from "@/api/users/getAllUsers";
import { EvaluatorProps } from "@/app/dashboard/form-generator/data/EvaluationFormTypes";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroups } from "@/identity/groups/services/getGroups";
import { cn } from "@/lib/utils";

interface FindUserProps {
  user: EvaluatorProps | undefined;
  setUser: (data: EvaluatorProps | undefined) => void;
  open: boolean;
  setOpen: (data: boolean) => void;
}

export default function FindUser({
  user,
  setUser,
  setOpen,
  open,
}: FindUserProps) {
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
    getUser();
  }, []);
  return (
    <div className="flex flex-col relative mb-5">
      <label className=" mt-[.5rem] mx-[1.5rem] select-none">بازرس</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-[200px] justify-between mx-[1rem] text-[.9rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0`}
          >
            {user ? `${user?.name} ${user?.lastname}` : "جستجو"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="جستجو" dir="rtl" />
            <CommandEmpty>نتیجه ای یافت نشد.</CommandEmpty>
            <CommandGroup className="max-h-72 overflow-y-auto">
              {users?.map((value) => (
                <CommandItem
                  key={value?.id}
                  value={value}
                  onSelect={() => {
                    if (value !== user) {
                      setUser(value);
                      setOpen(false);
                    } else {
                      setUser(undefined);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {value?.name} {value?.lastname}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
