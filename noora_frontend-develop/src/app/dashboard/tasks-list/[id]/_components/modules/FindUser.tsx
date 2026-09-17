import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";

import { EvaluatorProps } from "@/app/dashboard/form-generator/data/EvaluationFormTypes";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FindUserProps {
  user: EvaluatorProps | undefined;
  setUser: (data: EvaluatorProps | undefined) => void;
  data: any;
  disabled?: boolean;
}

export default function FindUser({
  user,
  setUser,
  data,
  disabled,
}: FindUserProps) {
  const [users, setUsers] = useState<Array<any> | undefined>();
  const [searchedName, setSearchedName] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);

  const searchByNameAndLastname = useCallback(
    async (searchTerm: string) => {
      const searchWords = searchTerm.split(" ");
      const filteredData = data?.members?.filter((item: any) => {
        for (const word of searchWords) {
          if (!item.name.includes(word) && !item.lastname.includes(word)) {
            return false;
          }
        }
        return true;
      });
      return setUsers(filteredData);
    },
    [data?.members],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchedName) {
        searchByNameAndLastname(searchedName);
      } else {
        setUsers(data?.members);
      }
    }, 300);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [data?.members, searchByNameAndLastname, searchedName]);
  console.log(user);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled} className=" w-[30%]">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-[.9rem] max-w-[400px]  items-center h-[40px] justify-between w-full pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0">
          {user ? `${user?.name} ${user?.lastname}` : "جستجو"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <Input
            onChange={(e) => setSearchedName(e.target.value)}
            placeholder="جستجو"
            dir="rtl"
          />
          <CommandEmpty>یافت نشد...</CommandEmpty>
          <CommandGroup className="max-h-[27rem] overflow-y-auto">
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
                }}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value?.id === user?.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {value?.name} {value?.lastname}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
