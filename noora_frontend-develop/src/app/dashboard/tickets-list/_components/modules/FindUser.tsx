import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import GetAllUsers from "@/api/users/getAllUsers";
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
  type?: string;
  disabled?: boolean;
}

export default function FindUser({
  user,
  setUser,
  type,
  disabled,
}: FindUserProps) {
  const [users, setUsers] = useState<Array<any> | undefined>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [searchedName, setSearchedName] = useState<string>("");

  const getUser = useCallback(async () => {
    try {
      const res = await GetAllUsers({
        page: 0,
        size: Number.MAX_SAFE_INTEGER,
        type,
      });
      setUsers(res.result?.data);
    } catch (err) {
      toast.error("خطایی رخ داد!");
    }
  }, [type]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const filteredUsers = users?.filter(
    (user) =>
      user.name.includes(searchedName) || user.lastname.includes(searchedName),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled} className=" w-[30%]">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="text-[.9rem] max-w-[300px]  items-center h-[40px] justify-between w-full pl-[2.8rem] pr-[.5rem] border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0">
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
            {filteredUsers?.map((value) => (
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
